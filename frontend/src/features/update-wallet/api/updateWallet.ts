import type { WalletStatus } from "../../../entities/wallet/model/types"
import { apiClient } from "../../../shared/api/client"

type UpdateWalletRequest = {
    status?: WalletStatus,
    accountNumber?: string
}

export function updateWallet(walletCode: string, request: UpdateWalletRequest) {
    return apiClient.patch<void>(`/platform/wallets/${encodeURIComponent(walletCode)}`, request)
}