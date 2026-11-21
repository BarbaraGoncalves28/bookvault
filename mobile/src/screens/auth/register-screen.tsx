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
  ArrowRight,
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
      {/* CAMADA DE PROFUNDIDADE SOBRE O BACKGROUND */}
      <View
        className="absolute inset-0 bg-[#17152B]/55"
        pointerEvents="none"
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow items-center justify-center px-4 py-6 md:px-5 md:py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md">

            {/* BRAND */}
            <View className="mb-6 items-center md:mb-7">
              <View className="relative">
                <View className="absolute -inset-2 rounded-[30px] bg-brand-500/15" />

                <View className="overflow-hidden rounded-[28px] border border-brand-500/70 bg-[#17152B]/40 p-1.5">
                  <Image
                    source={require('../../../assets/logo.png')}
                    style={{
                      width: 78,
                      height: 78,
                      borderRadius: 20,
                    }}
                    resizeMode="cover"
                  />
                </View>
              </View>

              <Text className="mt-5 text-xl font-bold tracking-tight text-white">
                BookVault
              </Text>

              <Text className="mt-1 text-center text-xs font-medium text-white/70">
                Sua biblioteca. Seu espaço. Sua jornada.
              </Text>
            </View>

            {/* REGISTER CARD */}
            <Card
              className="
                overflow-hidden
                rounded-[30px]
                border
                border-white/60
                bg-white/60
                p-0
                shadow-2xl
              "
            >
              {/* CARD HEADER */}
              <View className="border-b border-white/45 px-5 pb-5 pt-6 md:px-7 md:pb-6 md:pt-7">
                <Text className="text-center text-[26px] font-bold tracking-tight text-night-900 md:text-[30px]">
                  Crie sua conta
                </Text>

                <Text className="mt-2 max-w-sm px-1 text-center text-sm leading-5 text-white">
                  Cadastre-se para criar seu espaço de leitura.
                </Text>
              </View>

              {/* FORM */}
              <View className="px-5 pb-5 pt-5 md:px-7 md:pb-7 md:pt-6">
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
  <View className="mt-4 overflow-hidden rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3">
    <View className="flex-row items-center gap-2.5">
      <View className="h-2 w-2 rounded-full bg-red-500" />
      <Text
        className="flex-1 text-xs font-semibold leading-5"
        style={{ color: colors.danger }}
      >
        {error}
      </Text>
    </View>
  </View>
) : null}

                {/* ACTION */}
                <View className="mt-8">
                  <Button
                    title="Criar conta"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                  />
                </View>

                {/* LOGIN LINK */}
                <View className="mt-6 flex-col items-center justify-center gap-2 px-2 md:flex-row md:flex-wrap">
                  <Text className="text-center text-sm font-medium text-night-600">
                    Já possui uma conta?
                  </Text>

                  <Link
                    href="/login"
                    className="md:ml-1.5"
                  >
                    <View className="flex-row items-center gap-1">
                      <Text className="text-sm font-bold text-brand-500">
                        Entrar
                      </Text>

                      <ArrowRight
                        size={14}
                        color="#B100CD"
                        strokeWidth={2.2}
                      />
                    </View>
                  </Link>
                </View>
              </View>
            </Card>

            {/* FOOTER */}
            <View className="mt-5 items-center">
              <Text className="text-[11px] font-medium text-white/50">
                Organize. Descubra. Leia.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}