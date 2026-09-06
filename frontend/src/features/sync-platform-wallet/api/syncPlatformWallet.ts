import { apiClient } from '../../../shared/api/client'
import type { WalletStatus } from '../../../entities/wallet/model/types'

export type SyncPlatformWalletRequest = {
    mid: string
    walletCode: string
    status: WalletStatus
    accountNumber?: string
}

export function syncPlatformWallet(request: SyncPlatformWalletRequest) {
    return apiClient.put<void>('/platform/wallets', request)
}