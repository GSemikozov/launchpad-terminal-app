import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile, useUpdateProfile } from '@entities/profile';
import { Button, Card, Input, Skeleton } from '@shared/ui';

export function UserProfile() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const { data: profile, isLoading } = useProfile(walletAddress);
  const updateProfile = useUpdateProfile();

  const handleUpdate = async () => {
    if (!walletAddress) return;

    await updateProfile.mutateAsync({
      wallet: walletAddress,
      username: username || undefined,
      bio: bio || undefined,
    });
  };

  if (!walletAddress) {
    return (
      <Card padding='lg'>
        <p className='text-gray-400'>Please connect your wallet</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card padding='lg'>
        <Skeleton height={100} />
      </Card>
    );
  }

  return (
    <Card padding='lg'>
      <h3 className='text-xl font-bold text-white mb-4'>Profile</h3>

      <div className='space-y-4'>
        <div>
          <p className='text-sm text-gray-400'>Wallet Address</p>
          <p className='text-white font-mono'>{walletAddress}</p>
        </div>

        {profile && (
          <>
            {profile.username && (
              <div>
                <p className='text-sm text-gray-400'>Username</p>
                <p className='text-white'>{profile.username}</p>
              </div>
            )}

            {profile.bio && (
              <div>
                <p className='text-sm text-gray-400'>Bio</p>
                <p className='text-white'>{profile.bio}</p>
              </div>
            )}
          </>
        )}

        <div className='border-t border-dark-border pt-4 mt-4'>
          <h4 className='text-lg font-semibold text-white mb-3'>Update Profile</h4>
          <div className='space-y-3'>
            <Input
              label='Username'
              placeholder='Enter username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <Input
              label='Bio'
              placeholder='Enter bio'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              fullWidth
            />
            <Button
              variant='primary'
              onClick={handleUpdate}
              isLoading={updateProfile.isPending}
              className='w-full lg:w-auto !mt-6'
            >
              Update Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

