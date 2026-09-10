import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  Camera,
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2,
  UserRound,
  Contact,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Screen } from '../../../components/layout/screen';
import { Card } from '../../../components/ui/card';
import { BackButton } from '../../../components/layout/back-button';
import { Breadcrumb } from '../../../components/layout/breadcrumb';
import { Button } from '../../../components/ui/button';

import { useAuth } from '../../../hooks/use-auth';
import { useProfile } from '../../../hooks/use-profile';

import { usersService } from '../../../services/users-service';
import { uploadImageToCloudinary } from '../../../services/cloudinary-service';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();

  /*
   * Usamos o perfil buscado diretamente do backend.
   *
   * Isso garante que a foto exibida aqui seja a mesma
   * foto que já aparece no Sidebar e no Meu Perfil.
   */
  const {
    profile,
    loading: profileLoading,
  } = useProfile();

  const [name, setName] = useState('');

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  /*
   * Guarda a URI local da nova foto escolhida.
   *
   * Essa URI ainda não está no banco.
   * Ela só será enviada para o Cloudinary quando
   * o usuário clicar em "Salvar alterações".
   */
  const [selectedImageUri, setSelectedImageUri] =
    useState<string | null>(null);

  /*
   * Indica que o usuário quer remover a foto atual.
   *
   * Também só será enviado ao backend ao salvar.
   */
  const [removeAvatar, setRemoveAvatar] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [saving, setSaving] = useState(false);

  /*
   * Quando o perfil vier do backend, preenchemos
   * os campos da tela.
   */
  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name);
    setAvatarUrl(profile.avatarUrl);
    setRemoveAvatar(false);
    setSelectedImageUri(null);
  }, [profile]);

  /*
   * Caso o perfil ainda não tenha carregado,
   * usamos temporariamente os dados do AuthContext.
   */
  useEffect(() => {
    if (profile) {
      return;
    }

    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl);
    }
  }, [profile, user]);

  const handlePickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permissão necessária',
        text2:
          'Precisamos de acesso às suas fotos para escolher uma foto de perfil.',
        position: 'top',
        visibilityTime: 3500,
      });

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

    if (
      result.canceled ||
      !result.assets[0]
    ) {
      return;
    }

    const imageUri =
      result.assets[0].uri;

    /*
     * Mostra imediatamente o preview.
     */
    setSelectedImageUri(imageUri);
    setAvatarUrl(imageUri);

    /*
     * Se havia uma solicitação de remoção,
     * ela deixa de existir porque o usuário
     * escolheu uma nova foto.
     */
    setRemoveAvatar(false);
  };

  const handleRemoveAvatar = () => {
    /*
     * Apenas remove visualmente por enquanto.
     *
     * O banco só será alterado quando
     * "Salvar alterações" for clicado.
     */
    setAvatarUrl(null);
    setSelectedImageUri(null);
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    /*
     * =========================
     * VALIDAÇÃO DO NOME
     * =========================
     */
    if (!trimmedName) {
      Toast.show({
        type: 'error',
        text1: 'Nome obrigatório',
        text2:
          'Digite seu nome para continuar.',
        position: 'top',
        visibilityTime: 3000,
      });

      return;
    }

    if (trimmedName.length < 2) {
      Toast.show({
        type: 'error',
        text1: 'Nome inválido',
        text2:
          'O nome deve ter pelo menos 2 caracteres.',
        position: 'top',
        visibilityTime: 3000,
      });

      return;
    }

    /*
     * =========================
     * ALTERAÇÃO DE SENHA
     * =========================
     *
     * A senha só será alterada se algum
     * dos campos de senha tiver sido preenchido.
     */
    const changingPassword =
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0;

    if (changingPassword) {
      if (!currentPassword) {
        Toast.show({
          type: 'error',
          text1: 'Senha atual obrigatória',
          text2:
            'Digite sua senha atual para alterar a senha.',
          position: 'top',
          visibilityTime: 3000,
        });

        return;
      }

      if (!newPassword) {
        Toast.show({
          type: 'error',
          text1: 'Nova senha obrigatória',
          text2:
            'Digite uma nova senha.',
          position: 'top',
          visibilityTime: 3000,
        });

        return;
      }

      /*
       * IMPORTANTE:
       * A nova senha deve ter no mínimo 8 caracteres.
       */
      if (newPassword.length < 8) {
        Toast.show({
          type: 'error',
          text1: 'Senha muito curta',
          text2:
            'A nova senha deve ter pelo menos 8 caracteres.',
          position: 'top',
          visibilityTime: 3000,
        });

        return;
      }

      if (!confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Confirme sua nova senha',
          text2:
            'Digite novamente a nova senha.',
          position: 'top',
          visibilityTime: 3000,
        });

        return;
      }

      if (newPassword !== confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Senhas não coincidem',
          text2:
            'A confirmação da nova senha está diferente.',
          position: 'top',
          visibilityTime: 3000,
        });

        return;
      }
    }

    try {
      setSaving(true);

      /*
       * =========================
       * 1. ATUALIZA O NOME
       * =========================
       */
      await usersService.updateProfile({
        name: trimmedName,
      });

      /*
       * =========================
       * 2. FOTO
       * =========================
       *
       * Se escolheu uma nova foto:
       * primeiro envia para o Cloudinary.
       */
      if (selectedImageUri) {
        const uploadedAvatarUrl =
          await uploadImageToCloudinary(
            selectedImageUri,
          );

        await usersService.updateAvatar({
          avatarUrl: uploadedAvatarUrl,
        });
      }

      /*
       * Se pediu para remover a foto,
       * salva NULL no banco.
       */
      else if (removeAvatar) {
        await usersService.updateAvatar({
          avatarUrl: null,
        });
      }

      /*
       * =========================
       * 3. ALTERA A SENHA
       * =========================
       */
      if (changingPassword) {
        await usersService.changePassword({
          currentPassword,
          newPassword,
        });
      }

      /*
       * =========================
       * 4. BUSCA O USUÁRIO NOVAMENTE
       * =========================
       *
       * Aqui pegamos os dados reais que
       * estão atualmente no PostgreSQL.
       */
      const updatedUser =
        await usersService.me();

      console.log(
        'USUÁRIO ATUALIZADO:',
        updatedUser,
      );

      /*
       * =========================
       * 5. ATUALIZA O AUTH CONTEXT
       * =========================
       */
      updateUser(updatedUser);

      /*
       * Limpa o estado local.
       */
      setName(updatedUser.name);
      setAvatarUrl(updatedUser.avatarUrl);
      setSelectedImageUri(null);
      setRemoveAvatar(false);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Toast.show({
        type: 'success',
        text1: 'Perfil atualizado',
        text2:
          'Suas alterações foram salvas com sucesso.',
        position: 'top',
        visibilityTime: 2500,
      });

      router.back();
    } catch (error) {
      console.error(
        'Erro ao atualizar perfil:',
        error,
      );

      Toast.show({
        type: 'error',
        text1: 'Não foi possível atualizar',
        text2:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao salvar suas alterações.',
        position: 'top',
        visibilityTime: 3500,
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * Enquanto o perfil está sendo carregado,
   * não precisamos deixar a tela vazia.
   */
  const displayName =
    profile?.name ??
    user?.name ??
    '';

  const displayAvatar = avatarUrl;

  return (
    <Screen scroll>
      <View className="gap-6 pb-10">

        {/* =========================
            BREADCRUMB + VOLTAR
        ========================== */}
        <View className="mx-3">
          <Breadcrumb current="Editar perfil" />

          <View className="mt-1">
            <BackButton />
          </View>
        </View>

        {/* =========================
            TÍTULO DA PÁGINA
        ========================== */}
        <View className="mx-3">
          <View className="flex-row items-start gap-3 md:gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
              <Contact
                size={23}
                color="#B100CD"
                strokeWidth={2}
              />
            </View>

            <View className="flex-1">
              <Text className="text-2xl font-bold text-night-900 md:text-3xl">
                Editar perfil
              </Text>

              <Text className="mt-1 text-sm text-night-500 md:text-base">
                Gerencie suas informações pessoais e
                configurações de segurança.
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            CARD PRINCIPAL
        ========================== */}
        <Card
          className="
            mx-3
            gap-0
            overflow-visible
            rounded-[28px]
            border
            border-lavender-200
            bg-white
            p-0
            shadow-soft
          "
        >

          {/* =========================
              FOTO DE PERFIL
          ========================== */}
          <View className="p-5 md:p-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                <Camera
                  size={19}
                  color="#B100CD"
                  strokeWidth={2}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-night-900">
                  Foto de perfil
                </Text>

                <Text className="mt-0.5 text-sm text-night-500">
                  Escolha uma imagem para personalizar seu perfil.
                </Text>
              </View>
            </View>

            
<View className="mt-6 items-center">
  {/* AVATAR */}
  {displayAvatar ? (
    <Image
      source={{
        uri: displayAvatar,
      }}
      className="
        h-32
        w-32
        rounded-full
        border-4
        border-brand-500
      "
      resizeMode="cover"
    />
  ) : (
    <View
      className="
        h-32
        w-32
        items-center
        justify-center
        rounded-full
        border-4
        border-brand-500
        bg-brand-500
      "
    >
      <Text className="text-4xl font-bold text-white">
        {displayName
          .trim()
          .charAt(0)
          .toUpperCase() || 'U'}
      </Text>
    </View>
  )}

  {/* AÇÕES DA FOTO */}
  <View className="-mt-5 flex-row items-center justify-center gap-2">
    {/* ALTERAR FOTO */}
    <Pressable
      onPress={() => void handlePickImage()}
      disabled={saving}
      accessibilityRole="button"
      accessibilityLabel="Alterar foto de perfil"
      hitSlop={6}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [
          {
            scale: pressed ? 0.95 : 1,
          },
        ],
      })}
      className="
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        border-2
        border-white
        bg-brand-500
      "
    >
      <Camera
        size={14}
        color="#FFFFFF"
        strokeWidth={2.3}
      />
    </Pressable>

    {/* REMOVER FOTO */}
    {displayAvatar ? (
      <Pressable
        onPress={handleRemoveAvatar}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Remover foto de perfil"
        hitSlop={6}
        style={({ pressed }) => ({
          opacity: pressed ? 0.75 : 1,
          transform: [
            {
              scale: pressed ? 0.95 : 1,
            },
          ],
        })}
        className="
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          border-2
          border-white
          bg-[#FF0000]
        "
      >
        <Trash2
          size={14}
          color="#FFFFFF"
          strokeWidth={2.3}
        />
      </Pressable>
    ) : null}
  </View>
</View>
          </View>

          {/* DIVISÓRIA */}
          <View className="h-px w-full bg-lavender-200" />

          {/* =========================
              INFORMAÇÕES PESSOAIS
          ========================== */}
          <View className="p-5 md:p-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-lavender-50">
                <UserRound
                  size={19}
                  color="#B100CD"
                  strokeWidth={2}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-night-900">
                  Informações pessoais
                </Text>

                <Text className="mt-0.5 text-sm text-night-500">
                  Atualize os dados básicos da sua conta.
                </Text>
              </View>
            </View>

            <View className="mt-6 flex-row flex-wrap gap-4">

              {/* NOME */}
              <View className="w-full gap-2 md:min-w-[280px] md:flex-1">
                <Text className="text-sm font-bold text-night-900">
                  Nome:
                </Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor="#9995A6"
                  className="
                    h-12
                    rounded-xl
                    border
                    border-lavender-200
                    bg-lavender-50
                    px-4
                    text-base
                    text-night-900
                  "
                  maxLength={120}
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>

              {/* E-MAIL */}
              <View className="w-full gap-2 md:min-w-[280px] md:flex-1">
                <Text className="text-sm font-bold text-night-900">
                  E-mail:
                </Text>

                <View
                  className="
                    h-12
                    justify-center
                    rounded-xl
                    border
                    border-lavender-200
                    bg-lavender-50
                    px-4
                  "
                >
                  <Text
                    numberOfLines={1}
                    className="text-base text-night-500"
                  >
                    {profile?.email ??
                      user?.email ??
                      ''}
                  </Text>
                </View>

                <Text className="text-xs text-night-500">
                  O e-mail não pode ser alterado.
                </Text>
              </View>
            </View>
          </View>

          {/* DIVISÓRIA */}
          <View className="h-px w-full bg-lavender-200" />

          {/* =========================
              SEGURANÇA
          ========================== */}
          <View className="p-5 md:p-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-lavender-50">
                <ShieldCheck
                  size={19}
                  color="#B100CD"
                  strokeWidth={2}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-night-900">
                  Segurança
                </Text>

                <Text className="mt-0.5 text-sm text-night-500">
                  Atualize sua senha para manter sua conta protegida.
                </Text>
              </View>
            </View>

            <View className="mt-6 flex-row flex-wrap gap-4">

              {/* SENHA ATUAL */}
              <View className="w-full gap-2 md:min-w-[280px] md:flex-1">
                <Text className="text-sm font-bold text-night-900">
                  Senha atual:
                </Text>

                <View className="relative">
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Senha atual"
                    placeholderTextColor="#9995A6"
                    secureTextEntry={
                      !showCurrentPassword
                    }
                    className="
                      h-12
                      rounded-xl
                      border
                      border-lavender-200
                      bg-lavender-50
                      px-4
                      pr-12
                      text-base
                      text-night-900
                    "
                    editable={!saving}
                  />

                  <Pressable
                    onPress={() =>
                      setShowCurrentPassword(
                        (value) => !value,
                      )
                    }
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showCurrentPassword
                        ? 'Ocultar senha atual'
                        : 'Mostrar senha atual'
                    }
                    className="
                      absolute
                      right-0
                      top-0
                      h-12
                      w-12
                      items-center
                      justify-center
                    "
                  >
                    {showCurrentPassword ? (
                      <EyeOff
                        size={19}
                        color="#777486"
                        strokeWidth={2}
                      />
                    ) : (
                      <Eye
                        size={19}
                        color="#777486"
                        strokeWidth={2}
                      />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* NOVA SENHA */}
              <View className="w-full gap-2 md:min-w-[280px] md:flex-1">
                <Text className="text-sm font-bold text-night-900">
                  Nova senha:
                </Text>

                <View className="relative">
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nova senha"
                    placeholderTextColor="#9995A6"
                    secureTextEntry={
                      !showNewPassword
                    }
                    className="
                      h-12
                      rounded-xl
                      border
                      border-lavender-200
                      bg-lavender-50
                      px-4
                      pr-12
                      text-base
                      text-night-900
                    "
                    editable={!saving}
                  />

                  <Pressable
                    onPress={() =>
                      setShowNewPassword(
                        (value) => !value,
                      )
                    }
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showNewPassword
                        ? 'Ocultar nova senha'
                        : 'Mostrar nova senha'
                    }
                    className="
                      absolute
                      right-0
                      top-0
                      h-12
                      w-12
                      items-center
                      justify-center
                    "
                  >
                    {showNewPassword ? (
                      <EyeOff
                        size={19}
                        color="#777486"
                        strokeWidth={2}
                      />
                    ) : (
                      <Eye
                        size={19}
                        color="#777486"
                        strokeWidth={2}
                      />
                    )}
                  </Pressable>
                </View>

                <Text className="text-xs text-night-500">
                  Mínimo de 8 caracteres.
                </Text>
              </View>

              {/* CONFIRMAR NOVA SENHA */}
              <View className="w-full gap-2 md:min-w-[280px] md:flex-1">
                <Text className="text-sm font-bold text-night-900">
                  Confirmar nova senha:
                </Text>

                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirme a nova senha"
                    placeholderTextColor="#9995A6"
                    secureTextEntry={
                      !showConfirmPassword
                    }
                    className="
                      h-12
                      rounded-xl
                      border
                      border-lavender-200
                      bg-lavender-50
                      px-4
                      pr-12
                      text-base
                      text-night-900
                    "
                    editable={!saving}
                  />

                  <Pressable
                    onPress={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword
                        ? 'Ocultar confirmação da senha'
                        : 'Mostrar confirmação da senha'
                    }
                    className="
                      absolute
                      right-0
                      top-0
                      h-12
                      w-12
                      items-center
                      justify-center
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        size={19}
                        color="#777486"
                        strokeWidth={2}
                      />
                    ) : (
                      <Eye
                        size={19}
                        color="#777486"
                        strokeWidth={2}
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* DIVISÓRIA */}
          <View className="h-px w-full bg-lavender-200" />

          {/* =========================
              AÇÕES
          ========================== */}
          <View
  className="
    flex-row
    gap-3
    p-5
    md:items-center
    md:justify-end
    md:p-6
  "
>
            <Button
              title="Cancelar"
              variant="danger"
              onPress={() => router.back()}
              disabled={saving}
              className="flex-1 min-w-0 px-2 md:flex-none md:px-6"
            />

            <Button
              title={
                saving
                  ? 'Salvando...'
                  : 'Salvar alterações'
              }
              onPress={() => void handleSave()}
              disabled={
                saving || profileLoading
              }
              isLoading={saving}
              className="flex-1 min-w-0 px-2 md:flex-none md:px-6"
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}