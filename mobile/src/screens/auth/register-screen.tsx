import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react-native';
import { toast } from '../../utils/toast';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { TextInputField } from '../../components/ui/text-input-field';
import { useAuth } from '../../hooks/use-auth';
import { ApiError } from '../../services/api';
import { colors } from '../../constants/design-tokens';

export function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
  await register({
    name,
    email,
    password,
  });

  toast.success('Sua conta foi criada com sucesso!');
} catch (err) {
  setError(
    err instanceof ApiError
      ? err.message
      : 'Não foi possível criar sua conta.', 
  );
} finally {
  setIsSubmitting(false);
}
  }

  return (
    <ImageBackground
      source={require('../../../assets/login-background.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
      imageStyle={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* MÁSCARA SOBRE A IMAGEM */}
      <View
        className="absolute inset-0 bg-[#17152B]/50"
        pointerEvents="none"
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow items-center justify-center px-4 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md">

            {/* BRAND */}
            <View className="items-center">
              <View className="mb-5 items-center">
                <Image
                  source={require('../../../assets/logo.png')}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 28,
                    borderWidth: 1.5,
                    borderColor: '#B100CD',
                  }}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* REGISTER CARD */}
            <Card
              className="
                rounded-[28px]
                border
                border-white/65
                bg-white/60
                p-6
                shadow-2xl
              "
            >
              <View className="mb-8 items-center gap-1">
                <Text className="text-3xl font-semibold text-brand-900">
                  Crie sua conta
                </Text>

                <Text className="text-sm text-brand-600">
                  Cadastre-se para começar sua biblioteca.
                </Text>
              </View>

              {/* INPUTS */}
              <View className="gap-5">

                {/* NOME */}
                <TextInputField
                  label="Nome:"
                  value={name}
                  onChangeText={setName}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#4B4858"
                  autoCapitalize="words"
                  icon={UserRound}
                />

                {/* E-MAIL */}
                <TextInputField
                  label="E-mail:"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#4B4858"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  icon={Mail}
                />

                {/* SENHA */}
                <TextInputField
                  label="Senha:"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#4B4858"
                  secureTextEntry
                  icon={LockKeyhole}
                />

                {/* CONFIRMAR SENHA */}
                <TextInputField
                  label="Confirmar senha:"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Digite sua senha novamente"
                  placeholderTextColor="#4B4858"
                  secureTextEntry
                  icon={LockKeyhole}
                />

              </View>

              {/* ERROR */}
              {error ? (
                <View className="mt-3 px-1">
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.danger }}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* BUTTON */}
              <View className="mt-10 w-[60%] self-center">
                <Button
                  title="Criar conta"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                />
              </View>

              {/* LOGIN LINK */}
              <View className="mt-5 flex-row items-center justify-center gap-1">
                <Text className="text-sm text-night-700 font-semibold">
                  Já possui uma conta?
                </Text>

                <Link
                  href="/login"
                  className="text-sm text-brand-900"
                >
                  Entrar
                </Link>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
