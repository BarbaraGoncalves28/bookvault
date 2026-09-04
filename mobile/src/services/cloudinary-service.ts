import { Platform } from 'react-native';

import { env } from '../config/env';

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

export async function uploadImageToCloudinary(
  imageUri: string,
): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    /*
     * No Web, o URI da imagem precisa ser convertido
     * para Blob antes de ser enviado ao Cloudinary.
     */
    const imageResponse = await fetch(imageUri);

    if (!imageResponse.ok) {
      throw new Error(
        'Não foi possível carregar a imagem selecionada.',
      );
    }

    const blob = await imageResponse.blob();

    formData.append('file', blob, 'book-cover.jpg');
  } else {
    /*
     * No Android/iOS, o React Native aceita o formato
     * { uri, type, name } no FormData.
     */
    formData.append(
      'file',
      {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'book-cover.jpg',
      } as never,
    );
  }

  formData.append(
    'upload_preset',
    env.cloudinaryUploadPreset,
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      'Cloudinary upload error:',
      response.status,
      errorText,
    );

    throw new Error(
      `Não foi possível enviar a imagem para o Cloudinary. ${errorText}`,
    );
  }

  const data =
    (await response.json()) as CloudinaryUploadResponse;

  if (!data.secure_url) {
    throw new Error(
      'O Cloudinary não retornou a URL da imagem.',
    );
  }

  return data.secure_url;
}
