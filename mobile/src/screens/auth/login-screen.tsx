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
import { LockKeyhole, Mail } from 'lucide-react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { TextInputField } from '../../components/ui/text-input-field';
import { useAuth } from '../../hooks/use-auth';
import { ApiError } from '../../services/api';
import { colors } from '../../constants/design-tokens';

export function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel entrar.',
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

            {/* LOGIN CARD */}
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
                  Bem-vindo de volta
                </Text>

                <Text className="text-sm text-brand-600">
                  Entre na sua conta para continuar.
                </Text>
              </View>

              {/* INPUTS */}
<View className="gap-5">
  <TextInputField
    label="E-mail:"
    value={email}
    onChangeText={setEmail}
    placeholder="Digite seu e-mail"
    placeholderTextColor='#4B4858'
    autoCapitalize="none"
    keyboardType="email-address"
    icon={Mail}
  />

  <TextInputField
    label="Senha:"
    value={password}
    onChangeText={setPassword}
    placeholderTextColor='#4B4858'
    placeholder="Digite sua senha"
    secureTextEntry
    icon={LockKeyhole}
  />
</View>

              {error ? (
  <View className="mt-3 px-1">
    <Text className="text-sm font-medium" style={{ color: colors.danger }}>
      {error}
    </Text>
  </View>
) : null}

              <View className="mt-10 w-[50%] self-center">
                <Button
                  title="Entrar"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                />
              </View>

              <View className="mt-5 flex-row items-center justify-center gap-1">
                <Text className="text-sm text-night-700 font-semibold">
                  Ainda não possui uma conta?
                </Text>

                <Link
                  href="/cadastro"
                  className="text-sm text-brand-900"
                >
                  Criar conta
                </Link>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}