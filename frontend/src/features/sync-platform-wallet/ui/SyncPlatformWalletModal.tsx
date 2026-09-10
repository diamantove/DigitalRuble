import type { Client } from '../../../entities/client/model/types'
import { Modal } from '../../../shared/ui/modal'
import { SyncPlatformWalletForm } from './SyncPlatformWalletForm'

type SyncPlatformWalletModalProps = {
    client: Client
    onClose: () => void
    onSynced: () => void
}

export function SyncPlatformWalletModal({client, onClose, onSynced}: SyncPlatformWalletModalProps) {
    return (
        <Modal
            title="Создать кошелек"
            subtitle="Синхронизация кошелька через PlatformWallets"
            onClose={onClose}
        >
            <SyncPlatformWalletForm
                client={client}
                onSynced={onSynced}
                onCancel={onClose}
            />
        </Modal>
    )
}