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
          className="absolute inset-0 z-40 bg-black/60"
        />
      ) : null}

      {/* CONTAINER EXTERNO */}
      <View
        className={`
          relative
          h-full
          ${
            isMobile
              ? 'absolute left-0 top-0 z-50'
              : 'relative z-0'
          }
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
            bg-[#17152B]
          "
          style={{
            width: sidebarWidth,
            borderRightColor: '#3A364D',
          }}
        >
          {/* CONTEÚDO */}
          <View className="h-full">

            {/* ÁREA SUPERIOR */}
            <View className="flex-1 px-4 pt-6">

              {/* CABEÇALHO */}
              <View
                className={`
                  relative
                  mb-8
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
                <View
                  className="
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#201E2E]
                  "
                  style={{
                    width: sidebarExpanded ? 70 : 40,
                    height: sidebarExpanded ? 70 : 40,
                    borderRadius: sidebarExpanded ? 20 : 12,
                    borderWidth: 1,
                    borderColor: '#3A364D',
                    shadowColor: '#000000',
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={require('../../../assets/logo.png')}
                    style={{
                      width: sidebarExpanded ? 64 : 34,
                      height: sidebarExpanded ? 64 : 34,
                      borderRadius: sidebarExpanded ? 18 : 10,
                    }}
                    resizeMode="cover"
                  />
                </View>

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
                      bg-[#201E2E]
                    "
                    style={{
                      borderColor: '#3A364D',
                    }}
                  >
                    <X
                      size={18}
                      color="#E5E1EE"
                      strokeWidth={2.2}
                    />
                  </Pressable>
                ) : null}
              </View>

              {/* NAVEGAÇÃO */}
              <View className="gap-1.5">
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
                            ? 'bg-[#2A273A]'
                            : 'bg-transparent'
                        }
                      `}
                      style={
                        active
                          ? {
                              borderWidth: 1,
                              borderColor: 'rgba(177, 0, 205, 0.28)',
                            }
                          : undefined
                      }
                    >
                      {/* INDICADOR DA PÁGINA ATIVA */}
                      {active ? (
                        <View
                          className="
                            absolute
                            left-0
                            h-7
                            w-1
                            rounded-r-full
                            bg-[#CA5CDD]
                          "
                          style={{
                            shadowColor: '#CA5CDD',
                            shadowOffset: {
                              width: 0,
                              height: 0,
                            },
                            shadowOpacity: 0.35,
                            shadowRadius: 5,
                            elevation: 3,
                          }}
                        />
                      ) : null}

                      {/* ÍCONE */}
                      <Icon
                        size={20}
                        color={
                          active
                            ? '#E8BCF0'
                            : '#777486'
                        }
                        strokeWidth={
                          active ? 2.3 : 2
                        }
                      />

                      {/* TEXTO */}
                      {sidebarExpanded ? (
                        <Text
                          numberOfLines={1}
                          className={`
                            flex-1
                            text-sm
                            ${
                              active
                                ? 'font-semibold text-[#FAF9FC]'
                                : 'font-medium text-[#777486]'
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
                  px-4
                  pb-4
                  pt-4
                "
                style={{
                  borderTopWidth: 1,
                  borderTopColor: '#3A364D',
                }}
              >
                {/* USUÁRIO */}
                <Pressable
                  onPress={() =>
                    handleNavigation('/perfil')
                  }
                  className="
                    mb-3
                    flex-row
                    items-center
                    gap-3
                    rounded-xl
                    bg-[#201E2E]
                    px-3
                    py-3
                  "
                  style={{
                    borderWidth: 1,
                    borderColor: '#3A364D',
                  }}
                >
                  <ProfileAvatar
                    name={user?.name}
                    avatarUrl={user?.avatarUrl}
                    size="md"
                  />

                  <View className="flex-1">
                    <Text
                      className="
                        mb-0.5
                        text-[11px]
                        font-medium
                        text-[#777486]
                      "
                    >
                      Olá,
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="
                        text-sm
                        font-semibold
                        text-[#FAF9FC]
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
                    text-[10px]
                    font-medium
                    text-[#4B4858]
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
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              bg-[#201E2E]
            "
            style={{
              borderColor: '#3A364D',
              shadowColor: '#000000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.28,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {collapsed ? (
              <ChevronRight
                size={17}
                color="#E5E1EE"
                strokeWidth={2.3}
              />
            ) : (
              <ChevronLeft
                size={17}
                color="#E5E1EE"
                strokeWidth={2.3}
              />
            )}
          </Pressable>
        ) : null}
      </View>
    </>
  );
}
