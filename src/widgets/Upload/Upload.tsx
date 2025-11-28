import { useState } from 'react';
import { useUploadImage } from '@shared/api';
import { Button, Card, Input, useToast } from '@shared/ui';

export function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string>('');
  const { showSuccess, showError } = useToast();

  const uploadImage = useUploadImage();

  const MAX_FILE_SIZE = 1 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      showError(`File size exceeds maximum allowed size of 1 MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`);
      e.target.value = '';
      setFile(null);
      setPreview('');
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(selectedFile.type)) {
      showError('Invalid image format. Please use JPEG, PNG, GIF, or WebP');
      e.target.value = '';
      setFile(null);
      setPreview('');
      return;
    }

    setFile(selectedFile);
    showSuccess(`File selected: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showError('Please select a file');
      return;
    }

    try {
      const result = await uploadImage.mutateAsync({
        file,
        metadata: {
          name: name || undefined,
          description: description || undefined,
        },
      });

      showSuccess(`File uploaded successfully! URL: ${result.url}`);

      setFile(null);
      setPreview('');
      setName('');
      setDescription('');
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error?.message || 'Upload failed. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <Card padding='lg'>
      <h3 className='text-xl font-bold text-white mb-4'>Upload to IPFS</h3>

      <div className='space-y-4'>
        {/* File Input */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Select File</label>
          <input
            type='file'
            accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
            onChange={handleFileChange}
            className='block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-primary file:text-white hover:file:opacity-90 file:cursor-pointer'
          />
          <p className='text-xs text-gray-400 mt-1'>
            Maximum file size: 1 MB. Supported formats: JPEG, PNG, GIF, WebP
          </p>
        </div>

        {/* Preview */}
        {preview && (
          <div className='rounded-xl overflow-hidden border border-dark-border'>
            <img src={preview} alt='Preview' className='w-full h-48 object-cover' />
          </div>
        )}

        {/* Metadata */}
        <Input
          label='Name (optional)'
          placeholder='Enter file name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <Input
          label='Description (optional)'
          placeholder='Enter description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />

        {/* Upload Button */}
        <Button
          variant='primary'
          onClick={handleUpload}
          disabled={!file}
          isLoading={uploadImage.isPending}
          fullWidth
        >
          Upload to IPFS
        </Button>

        {/* Result */}
        {uploadImage.isSuccess && uploadImage.data && (
          <div className='rounded-xl border border-success/30 bg-success/10 p-4'>
            <p className='text-success font-semibold mb-2'>Upload Successful!</p>
            <div className='space-y-1 text-sm'>
              <p className='text-gray-300'>
                <span className='text-gray-400'>Photo Hash:</span>{' '}
                <code className='font-mono'>{uploadImage.data.photo}</code>
              </p>
              <p className='text-gray-300'>
                <span className='text-gray-400'>URL:</span>{' '}
                <a
                  href={uploadImage.data.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  {uploadImage.data.url}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {uploadImage.isError && (
          <div className='rounded-xl border border-error/30 bg-error/10 p-4'>
            <p className='text-error'>
              Upload failed: {uploadImage.error?.message || 'Unknown error'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
