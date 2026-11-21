
import { Platform } from 'react-native';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';

import { env } from '../config/env';

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  error?: {
    message?: string;
  };
};

function getImageMimeType(uri: string): string {
  const cleanUri = uri.split('?')[0].toLowerCase();

  if (cleanUri.endsWith('.png')) return 'image/png';
  if (cleanUri.endsWith('.webp')) return 'image/webp';
  if (cleanUri.endsWith('.gif')) return 'image/gif';

  return 'image/jpeg';
}

export async function uploadImageToCloudinary(
  imageUri: string,
): Promise<string> {
  const formData = new FormData();

  try {
    if (Platform.OS === 'web') {
      const imageResponse = await fetch(imageUri);

      if (!imageResponse.ok) {
        throw new Error('Não foi possível carregar a imagem selecionada.');
      }

      const blob = await imageResponse.blob();
      const mimeType = blob.type || getImageMimeType(imageUri);
      const extension = mimeType.split('/')[1] || 'jpg';

      formData.append('file', blob, `book-cover.${extension}`);
    } else {
      const imageFile = new File(imageUri);

      if (!imageFile.exists) {
        throw new Error('O arquivo da imagem selecionada não foi encontrado.');
      }

      formData.append('file', imageFile);
    }

    formData.append('upload_preset', env.cloudinaryUploadPreset);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`;

    const response =
      Platform.OS === 'web'
        ? await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
          })
        : await expoFetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
          });

    const data =
      (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok) {
      console.error('Cloudinary upload error:', response.status, data);

      throw new Error(
        data.error?.message ||
          'O serviço de imagens não conseguiu receber a capa.',
      );
    }

    if (!data.secure_url) {
      throw new Error('O serviço de imagens não retornou o endereço da capa.');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Erro ao enviar capa:', error);

    if (error instanceof Error && error.message.startsWith('Não foi possível')) {
      throw error;
    }

    throw new Error(
      'Não foi possível enviar a capa. Verifique sua conexão e tente novamente.',
    );
  }
}
