export type WalletStatus = 'prcs' | 'actv' | 'blck' | 'clsd'

export type Wallet = {
    code: string,
    status: WalletStatus,
    accountNumber: string | null
}