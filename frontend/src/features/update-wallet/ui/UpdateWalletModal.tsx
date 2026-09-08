import type { Wallet } from '../../../entities/wallet/model/types'
import { Modal } from '../../../shared/ui/modal'
import { UpdateWalletForm } from './UpdateWalletForm'

type UpdateWalletModalProps = {
    wallet: Wallet
    onClose: () => void
    onUpdated: () => Promise<void>
}

export function UpdateWalletModal({ wallet, onClose, onUpdated }: UpdateWalletModalProps) {
    return (
        <Modal
            title="Кошелек"
            subtitle={`Изменение данных · ${wallet.code}`}
            onClose={onClose}
        >
            <UpdateWalletForm
                wallet={wallet}
                onUpdated={onUpdated}
                onCancel={onClose}
            />
        </Modal>
    )
}