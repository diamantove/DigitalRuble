import type { WalletStatus } from '../model/types'

const allowedTransitions: Record<WalletStatus, readonly WalletStatus[]> = {
    prcs: ['actv'],
    actv: ['blck'],
    blck: ['actv', 'clsd'],
    clsd: [],
}

export function getAllowedWalletStatusTransitions(currentStatus: WalletStatus): readonly WalletStatus[] {
    return allowedTransitions[currentStatus]
}

export function isAllowedWalletStatusTransition(currentStatus: WalletStatus, nextStatus: WalletStatus): boolean {
    return allowedTransitions[currentStatus].includes(nextStatus)
}