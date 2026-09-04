import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { jwtConfig } from '../../../config/jwt';
import { AppError } from '../../../shared/errors/app-error';
import type { JwtPayload } from '../../../shared/types/auth';
import { normalizeEmail } from '../../../shared/utils/normalize-email';
import type { AuthResponseDTO, AuthUserDTO, LoginDTO, RegisterUserDTO } from '../dtos/auth.dto';
import { UsersRepository } from '../repositories/users.repository';

const passwordSaltRounds = 10;

export class AuthService {
  constructor(private readonly usersRepository = new UsersRepository()) {}

  async register(data: RegisterUserDTO): Promise<AuthResponseDTO> {
    const email = normalizeEmail(data.email);
    const userAlreadyExists = await this.usersRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new AppError('Email is already in use.', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, passwordSaltRounds);
    const user = await this.usersRepository.create({
      name: data.name.trim(),
      email,
      password: hashedPassword,
    });

    return this.buildAuthResponse(this.toAuthUser(user));
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const email = normalizeEmail(data.email);
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);

    if (!passwordMatches) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    return this.buildAuthResponse(this.toAuthUser(user));
  }

  async getProfile(userId: string): Promise<AuthUserDTO> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return this.toAuthUser(user);
  }

  private buildAuthResponse(user: AuthUserDTO): AuthResponseDTO {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return {
      token,
      user,
    };
  }

  private toAuthUser(user: AuthUserDTO & { password?: string }): AuthUserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
