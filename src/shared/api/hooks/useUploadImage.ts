import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@app/config/api';
import { apiClient } from '@shared/api/client';

export interface UploadImageResponse {
  status: string;
  photo: string;
  url: string;
}

export interface UploadRequest {
  file: string; // base64 encoded file
  metadata?: string; // stringified JSON: "{\"name\":\"...\",\"description\":\"...\"}"
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (params: {
      file: File;
      metadata?: { name?: string; description?: string; symbol?: string };
    }) => {
      const base64File = await fileToBase64(params.file);

      let metadataString: string | undefined;
      if (params.metadata && (params.metadata.name || params.metadata.description || params.metadata.symbol)) {
        const metadataObj: Record<string, string> = {};
        if (params.metadata.name) metadataObj.name = params.metadata.name;
        if (params.metadata.description) metadataObj.description = params.metadata.description;
        if (params.metadata.symbol) metadataObj.symbol = params.metadata.symbol;
        metadataString = JSON.stringify(metadataObj);
      }

      const response = await apiClient.post<UploadImageResponse>(API_ENDPOINTS.upload, {
        file: base64File,
        metadata: metadataString,
      } as UploadRequest);
      return response.data;
    },
  });
}
