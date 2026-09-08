import type { Client } from '../../../entities/client/model/types'
import { Modal } from '../../../shared/ui/modal'
import { AssignParticipantIdForm } from './AssignParticipantIdForm'

type AssignParticipantIdModalProps = {
    client: Client
    onClose: () => void
    onAssigned: (participantId: string) => void
}

export function AssignParticipantIdModal({client, onClose, onAssigned}: AssignParticipantIdModalProps) {
    return (
        <Modal
            title="Данные клиента"
            subtitle="Выберите поле для редактирования"
            onClose={onClose}
        >
            <AssignParticipantIdForm
                mid={client.mid}
                onAssigned={onAssigned}
                onCancel={onClose}
            />
        </Modal>
    )
}