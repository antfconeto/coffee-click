import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


const s3Client = new S3Client({
  region: 'sa-east-1',
  credentials: {
    accessKeyId:process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey:process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  },
  apiVersion: '2006-03-01',
});


const BUCKET_NAME = 'app-coffee-1'!;
const BUCKET_REGION = 'sa-east-1';

export interface S3UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface S3PresignedResult {
  success: boolean;
  presignedUrl: string;
  key: string;
  publicUrl: string;
  error?: string;
}

export class S3Service {

    /**
   * Obtém a extensão do arquivo de forma segura
   * @param fileName Nome do arquivo
   * @returns Extensão do arquivo ou 'bin' como fallback
   */
  private static getFileExtension(fileName: string): string {
    // Verificar se o arquivo tem uma extensão válida
    const lastDotIndex = fileName.lastIndexOf('.');
    
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return 'bin';
    }
    
    const extension = fileName.substring(lastDotIndex + 1).toLowerCase();
    const validExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', // Imagens
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', // Vídeos
      'pdf', 'doc', 'docx', 'txt', 'rtf', // Documentos
      'zip', 'rar', '7z', 'tar', 'gz' // Arquivos compactados
    ];
    
    if (validExtensions.includes(extension)) {
      return extension;
    }
    
    return 'bin';
  }

  static async generatePresignedUrl(
    fileName: string,
    contentType: string,
    folder: string = 'coffees'
  ): Promise<S3PresignedResult> {
    try {
      // Gerar nome único para o arquivo
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = this.getFileExtension(fileName);
      const key = `${folder}/${randomId}.${fileExtension}`;

      // Criar comando para URL pré-assinada
      const putObjectCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      });

      // Gerar URL pré-assinada (válida por 1 hora)
      const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });

      return {
        success: true,
        presignedUrl,
        key,
        publicUrl: `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${key}`
      };

    } catch (error) {
      console.error('Erro ao gerar URL pré-assinada:', error);
      return {
        success: false,
        presignedUrl: '',
        key: '',
        publicUrl: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar URL pré-assinada'
      };
    }
  }

  static async uploadFileWithPresignedUrl(
    file: File,
    presignedUrl: string,
  ): Promise<S3UploadResult> {
    try {
      // Fazer upload usando a URL pré-assinada
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!response.ok) {
        throw new Error(`Upload falhou com status: ${response.status}`);
      }

      // Extrair a chave da URL pré-assinada
      const urlParts = presignedUrl.split('?')[0];
      const key = urlParts.split('/').slice(-2).join('/'); // Pega os últimos dois segmentos (folder/filename)

      // Construir a URL pública
      const fileUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${key}`;

      return {
        success: true,
        url: fileUrl,
        key
      };

    } catch (error) {
      console.error('Erro no upload usando URL pré-assinada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
      };
    }
  }

  // Método legado mantido para compatibilidade (pode ser removido posteriormente)
  static async uploadFile(
    file: File,
    folder: string = 'coffees'
  ): Promise<S3UploadResult> {
    try {
      // Gerar nome único para o arquivo
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = this.getFileExtension(file.name);
      console.log("✍️✍️✍️ fileExtension", fileExtension);
      const fileName = `${folder}/${randomId}.${fileExtension}`;
      console.log("filetype", file.type);
      // Converter File para Buffer ou Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Preparar o comando de upload
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: uint8Array,
        ContentType: file.type,
        ACL: 'public-read', // Tornar o arquivo público
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });

      // Fazer o upload
      const response = await s3Client.send(uploadCommand);
      console.log('S3 Upload Response:', response.$metadata.httpStatusCode);
      
      // Construir a URL pública
      const fileUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${fileName}`;

      return {
        success: true,
        url: fileUrl,
        key: fileName
      };

    } catch (error) {
      console.error('Erro no upload para S3:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
      };
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    folder: string = 'coffees',
  ): Promise<S3UploadResult[]> {
    const results: S3UploadResult[] = [];
    let completed = 0;

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, folder);

        results.push(result);
        completed++;

      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Erro no upload'
        });
        completed++;
      }
    }

    return results;
  }


  static async deleteFile(key: string): Promise<boolean> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });

      await s3Client.send(deleteCommand);
      return true;

    } catch (error) {
      console.error('Erro ao deletar arquivo do S3:', error);
      return false;
    }
  }
  static async getPresignedUrl(
    fileName: string,
    contentType: string,
    folder: string = 'coffees'
  ): Promise<string | null> {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = fileName.split('.').pop();
      const key = `${folder}/${timestamp}-${randomId}.${fileExtension}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read'
      });

      const presignedUrl = await getSignedUrl(s3Client, uploadCommand, { expiresIn: 3600 });
      return presignedUrl;

    } catch (error) {
      console.error('Erro ao gerar URL pré-assinada:', error);
      return null;
    }
  }
}
