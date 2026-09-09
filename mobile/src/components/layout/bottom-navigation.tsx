import React from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  BookOpen,
  Check,
  Heart,
  LibraryBig,
  ListChecks,
  MoreHorizontal,
} from 'lucide-react-native';

import { router, usePathname } from 'expo-router';

import { ProfileAvatar } from '../profile/profile-avatar';
import { useAuth } from '../../hooks/use-auth';
import { SidebarLogout } from './sidebar-logout';

type NavigationItem = {
  label: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  route: string;
};

const mainItems: NavigationItem[] = [
  {
    label: 'Livros',
    icon: LibraryBig,
    route: '/home',
  },
  {
    label: 'Quero ler',
    icon: ListChecks,
    route: '/quero-ler',
  },
  {
    label: 'Favoritos',
    icon: Heart,
    route: '/favoritos',
  },
  {
    label: 'Perfil',
    icon: ProfileIcon,
    route: '/perfil',
  },
];

const moreItems: NavigationItem[] = [
  {
    label: 'Lendo',
    icon: BookOpen,
    route: '/lendo',
  },
  {
    label: 'Lidos',
    icon: Check,
    route: '/lidos',
  },
];

function ProfileIcon({
  size = 20,
  color = '#777486',
  strokeWidth = 2,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: 999,
          borderWidth: strokeWidth,
          borderColor: color,
          marginBottom: size * 0.08,
        }}
      />

      <View
        style={{
          width: size * 0.7,
          height: size * 0.36,
          borderTopLeftRadius: size,
          borderTopRightRadius: size,
          borderWidth: strokeWidth,
          borderBottomWidth: 0,
          borderColor: color,
          position: 'absolute',
          bottom: size * 0.04,
        }}
      />
    </View>
  );
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [isMoreOpen, setIsMoreOpen] =
    React.useState(false);

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
    setIsMoreOpen(false);
    router.push(route as never);
  }

  const moreIsActive =
    isActive('/lendo') ||
    isActive('/lidos');

  return (
    <View
      className="relative z-50"
      style={{
        backgroundColor: '#17152B',
      }}
    >
      {/* =====================================================
          MINI MENU — MAIS
          ===================================================== */}

      {isMoreOpen ? (
        <>
          {/* ÁREA TRANSPARENTE PARA FECHAR */}

          <Pressable
            onPress={() => setIsMoreOpen(false)}
            className="absolute inset-0 z-40"
          />

          {/* PAINEL */}

          <View
            className="
              absolute
              bottom-[76px]
              right-3
              z-50
              w-[235px]
              overflow-hidden
              rounded-2xl
              border
              border-[#3A364D]
              bg-[#17152B]
              p-2
            "
            style={{
              shadowColor: '#000000',
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* =================================================
                NAVEGAÇÃO EXTRA
                ================================================= */}

            <View className="gap-1.5">
              {moreItems.map((item) => {
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
                      gap-3
                      rounded-xl
                      px-3
                      py-3
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
                            borderColor:
                              'rgba(177, 0, 205, 0.28)',
                          }
                        : undefined
                    }
                  >
                    {/* INDICADOR ATIVO */}

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
                  </Pressable>
                );
              })}
            </View>

            {/* DIVISOR */}

            <View
              className="my-2"
              style={{
                height: 1,
                backgroundColor: '#3A364D',
              }}
            />

            {/* =================================================
                USUÁRIO
                ================================================= */}

            <Pressable
              onPress={() =>
                handleNavigation('/perfil')
              }
              className="
                mb-2
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

              <View className="min-w-0 flex-1">
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

            {/* =================================================
                SAIR
                ================================================= */}

            <View>
              <SidebarLogout />
            </View>

            {/* COPYRIGHT */}

            <Text
              className="
                mt-2
                text-center
                text-[10px]
                font-medium
                text-[#4B4858]
              "
            >
              © Bárbara Gonçalves 2026
            </Text>
          </View>
        </>
      ) : null}

      {/* =====================================================
          BARRA INFERIOR
          ===================================================== */}

      <View
        className="
          border-t
          border-[#3A364D]
          bg-[#17152B]
          px-2
          pb-2
          pt-2
        "
        style={{
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center">
          {/* =================================================
              ITENS PRINCIPAIS
              ================================================= */}

          {mainItems.map((item) => {
            const active = isActive(item.route);
            const Icon = item.icon;

            return (
              <Pressable
                key={item.route}
                onPress={() =>
                  handleNavigation(item.route)
                }
                className="
                  relative
                  flex-1
                  items-center
                  justify-center
                  px-1
                  py-1
                "
              >
                {/* CONTAINER DO ITEM */}

                <View
                  className={`
                    relative
                    min-w-[58px]
                    items-center
                    justify-center
                    rounded-xl
                    px-2
                    py-1.5
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
                          borderColor:
                            'rgba(177, 0, 205, 0.28)',
                        }
                      : undefined
                  }
                >
                  {/* INDICADOR ATIVO
                      Mesma linguagem do Sidebar,
                      adaptada para horizontal. */}

                  {active ? (
                    <View
                      className="
                        absolute
                        left-2
                        right-2
                        top-0
                        h-1
                        rounded-b-full
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

                  <Text
                    numberOfLines={1}
                    className={`
                      mt-1
                      text-[10px]
                      ${
                        active
                          ? 'font-semibold text-[#FAF9FC]'
                          : 'font-medium text-[#777486]'
                      }
                    `}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {/* =================================================
              MAIS
              ================================================= */}

          <Pressable
            onPress={() =>
              setIsMoreOpen((current) => !current)
            }
            className="
              relative
              flex-1
              items-center
              justify-center
              px-1
              py-1
            "
          >
            <View
              className={`
                relative
                min-w-[58px]
                items-center
                justify-center
                rounded-xl
                px-2
                py-1.5
                ${
                  isMoreOpen || moreIsActive
                    ? 'bg-[#2A273A]'
                    : 'bg-transparent'
                }
              `}
              style={
                isMoreOpen || moreIsActive
                  ? {
                      borderWidth: 1,
                      borderColor:
                        'rgba(177, 0, 205, 0.28)',
                    }
                  : undefined
              }
            >
              {/* INDICADOR ATIVO */}

              {isMoreOpen || moreIsActive ? (
                <View
                  className="
                    absolute
                    left-2
                    right-2
                    top-0
                    h-1
                    rounded-b-full
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

              <MoreHorizontal
                size={21}
                color={
                  isMoreOpen || moreIsActive
                    ? '#E8BCF0'
                    : '#777486'
                }
                strokeWidth={
                  isMoreOpen || moreIsActive
                    ? 2.3
                    : 2
                }
              />

              <Text
                className={`
                  mt-1
                  text-[10px]
                  ${
                    isMoreOpen || moreIsActive
                      ? 'font-semibold text-[#FAF9FC]'
                      : 'font-medium text-[#777486]'
                  }
                `}
              >
                Mais
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}