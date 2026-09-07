import { Platform } from 'react-native';

export const env = {
  apiUrl:
    Platform.OS === 'web'
      ? 'http://localhost:3333/api'
      : 'http://192.168.1.239:3333/api',

  cloudinaryCloudName: 'dlawjlwo9',

  cloudinaryUploadPreset: 'ml_default',
} as const;