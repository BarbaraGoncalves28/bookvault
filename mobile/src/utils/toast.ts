import Toast from 'react-native-toast-message';

export const toast = {
  success(message: string, title = 'Sucesso') {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 2500,
    });
  },

  error(message: string, title = 'Erro') {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3500,
    });
  },

  info(message: string, title = 'Informação') {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 2500,
    });
  },
};
