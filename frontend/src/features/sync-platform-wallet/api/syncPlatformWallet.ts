import { apiClient } from '../../../shared/api/client'
import type { WalletStatus } from '../../../entities/wallet/model/types'

export type SyncPlatformWalletRequest = {
    walletCode: string
    status: WalletStatus
    accountNumber?: string
}

export function syncPlatformWallet(mid: string, request: SyncPlatformWalletRequest) {
    return apiClient.put<void>(`/operator/clients/${encodeURIComponent(mid)}/wallets`, request)
}
