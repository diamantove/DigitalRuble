import type { WalletStatus } from '../model/types'

type WalletStatusMeta = {
    label: string
    className: string
}

const statusMeta: Record<WalletStatus, WalletStatusMeta> = {
    prcs: {
        label: 'Ожидает открытия',
        className: 'status-custom',
    },
    actv: {
        label: 'Активен',
        className: 'status-active',
    },
    blck: {
        label: 'Заблокирован',
        className: 'status-custom',
    },
    clsd: {
        label: 'Закрыт',
        className: 'status-inactive',
    },
}

export function getWalletStatusMeta(status: WalletStatus) {
    return statusMeta[status]
}