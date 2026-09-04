import React from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  BookOpen,
  Heart,
  LibraryBig,
  ListChecks,
  UserRound,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react-native';

import { usePathname, router } from 'expo-router';

import { SidebarLogout } from './sidebar-logout';
import { ProfileAvatar } from '../profile/profile-avatar';
import { useAuth } from '../../hooks/use-auth';

type SidebarItemProps = {
  label: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  route: string;
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const items: SidebarItemProps[] = [
  {
    label: 'Meus livros',
    icon: LibraryBig,
    route: '/home',
  },
  {
    label: 'Quero ler',
    icon: ListChecks,
    route: '/quero-ler',
  },
  {
    label: 'Lendo',
    icon: BookOpen,
    route: '/lendo',
  },
  {
    label: 'Lidos',
    icon: BookOpen,
    route: '/lidos',
  },
  {
    label: 'Favoritos',
    icon: Heart,
    route: '/favoritos',
  },
  {
    label: 'Meu Perfil',
    icon: UserRound,
    route: '/perfil',
  },
];

export function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  
  const { user } = useAuth();

  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [collapsed, setCollapsed] = React.useState(false);

  const sidebarExpanded = isMobile
    ? isOpen
    : !collapsed;

  const isActive = (route: string) => {
    if (route === '/home') {
      return pathname === '/home';
    }

    return (
      pathname === route ||
      pathname.startsWith(`${route}/`)
    );
  };

  function handleNavigation(route: string) {
    router.push(route as never);

    if (isMobile) {
      onClose();
    }
  }

  function handleToggleDesktop() {
    setCollapsed((current) => !current);
  }

  /*
   * No mobile, a Sidebar só existe enquanto estiver aberta.
   */
  if (isMobile && !isOpen) {
    return null;
  }

  /*
   * Largura visual da Sidebar.
   *
   * Desktop aberta: 256px
   * Desktop fechada: 80px
   * Mobile: 280px
   */
  const sidebarWidth = isMobile
    ? 280
    : collapsed
      ? 80
      : 256;

  /*
   * Espaço extra no desktop para o botão
   * ficar parcialmente para fora sem ser cortado.
   */
  const containerWidth = isMobile
    ? 280
    : sidebarWidth + 20;

  return (
    <>
      {/* OVERLAY — MOBILE */}
      {isMobile && isOpen ? (
        <Pressable
          onPress={onClose}
          className="absolute inset-0 z-40 bg-black/50"
        />
      ) : null}

      {/* CONTAINER EXTERNO */}
      <View
        className={`
          relative
          h-full
          ${isMobile
            ? 'absolute left-0 top-0 z-50'
            : 'relative z-0'}
        `}
        style={{
          width: containerWidth,
        }}
      >
        {/* SIDEBAR */}
        <View
          className="
            relative
            h-full
            overflow-hidden
            border-r
            border-slate-200
            bg-[#17152B]
          "
          style={{
            width: sidebarWidth,
          }}
        >
          {/* CONTEÚDO */}
          <View className="h-full">

            {/* ÁREA SUPERIOR */}
            <View className="flex-1 px-4 py-6">

              {/* CABEÇALHO */}
              <View
                className={`
                  relative
                  mb-10
                  items-center
                  justify-center
                  ${
                    sidebarExpanded
                      ? 'h-[76px]'
                      : 'h-[52px]'
                  }
                `}
              >
                {/* LOGO */}
                <Image
                  source={require('../../../assets/logo.png')}
                  style={{
                    width: sidebarExpanded ? 70 : 36,
                    height: sidebarExpanded ? 70 : 36,
                    borderRadius: sidebarExpanded ? 22 : 11,
                    borderWidth: 1.5,
                    borderColor: '#B100CD',
                  }}
                  resizeMode="cover"
                />

                {/* BOTÃO FECHAR — MOBILE */}
                {isMobile ? (
                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    className="
                      absolute
                      right-0
                      top-1
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/10
                      bg-[#25213D]
                    "
                  >
                    <X
                      size={19}
                      color="#D9D5E8"
                      strokeWidth={2.2}
                    />
                  </Pressable>
                ) : null}
              </View>

              {/* NAVEGAÇÃO */}
              <View className="gap-2">
                {items.map((item) => {
                  const active = isActive(item.route);
                  const Icon = item.icon;

                  return (
                    <Pressable
                      key={item.route}
                      onPress={() =>
                        handleNavigation(item.route)
                      }
                      className={`
                        relative
                        flex-row
                        items-center
                        rounded-xl
                        py-3
                        ${
                          sidebarExpanded
                            ? 'gap-3 px-4'
                            : 'justify-center px-2'
                        }
                        ${
                          active
                            ? 'bg-[#CA5CDD]'
                            : 'bg-transparent'
                        }
                      `}
                    >
                      {/* INDICADOR DA PÁGINA ATIVA */}
                      {active ? (
                        <View
                          className="
                            absolute
                            left-0
                            h-6
                            w-1
                            rounded-r-full
                            bg-[#F2F0FA]
                          "
                        />
                      ) : null}

                      {/* ÍCONE */}
                      <Icon
                        size={20}
                        color={
                          active
                            ? '#FFFFFF'
                            : '#A9A5BD'
                        }
                        strokeWidth={
                          active ? 2.4 : 2
                        }
                      />

                      {/* TEXTO */}
                      {sidebarExpanded ? (
                        <Text
                          numberOfLines={1}
                          className={`
                            flex-1
                            text-sm
                            font-semibold
                            ${
                              active
                                ? 'text-white'
                                : 'text-[#A9A5BD]'
                            }
                          `}
                        >
                          {item.label}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* RODAPÉ */}
            {sidebarExpanded ? (
              <View
                className="
                  border-t
                  border-white/10
                  px-4
                  py-4
                "
              >
                {/* USUÁRIO */}
                <Pressable
                  onPress={() =>
                    handleNavigation('/perfil')
                  }
                  className="
                    mb-4
                    flex-row
                    items-center
                    gap-3
                    rounded-xl
                    bg-[#1E1B33]
                    px-3
                    py-3
                  "
                >
                  <ProfileAvatar
                    name={user?.name}
                    avatarUrl={user?.avatarUrl}
                    size="md"
                  />

                  <View
                    className="
                      flex-1
                      flex-row
                      items-center
                      gap-1.5
                    "
                  >
                    <Text className="text-xs text-[#A9A5BD]">
                      Olá,
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="
                        flex-1
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      {user?.name || 'Usuário'}
                    </Text>
                  </View>
                </Pressable>

                {/* SAIR */}
                <SidebarLogout />

                {/* COPYRIGHT */}
                <Text
                  className="
                    mt-3
                    text-center
                    text-[11px]
                    text-[#777486]
                  "
                >
                  © Bárbara Gonçalves 2026
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* BOTÃO ABRIR / FECHAR — DESKTOP */}
        {!isMobile ? (
          <Pressable
            onPress={handleToggleDesktop}
            hitSlop={8}
            className="
              absolute
              right-0
              top-6
              z-50
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-[#25213D]
            "
            style={{
              shadowColor: '#000000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            {collapsed ? (
              <ChevronRight
                size={18}
                color="#D9D5E8"
                strokeWidth={2.4}
              />
            ) : (
              <ChevronLeft
                size={18}
                color="#D9D5E8"
                strokeWidth={2.4}
              />
            )}
          </Pressable>
        ) : null}
      </View>
    </>
  );
}
