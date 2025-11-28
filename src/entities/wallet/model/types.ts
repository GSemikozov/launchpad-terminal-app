export interface Wallet {
  id: string;
  address: string;
  name: string;
  isDefault: boolean;
  balance?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface CreateWalletRequest {
  name: string;
  isDefault: boolean;
}

export interface CreateWalletResponse {
  id: string;
  address: string;
  name: string;
  isDefault: boolean;
  privateKey?: string;
  mnemonic?: string;
}

export interface SetDefaultWalletRequest {
  publicKey: string;
}

export interface SetDefaultWalletResponse {
  success: boolean;
  message: string;
}

