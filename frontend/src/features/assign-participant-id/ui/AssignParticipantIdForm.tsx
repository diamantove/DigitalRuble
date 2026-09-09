import { useState, type SubmitEvent } from 'react'
import { assignParticipantId } from '../api/assignParticipantId'
import { Fingerprint, Landmark } from 'lucide-react'

type AssignParticipantIdFormProps = {
    mid: string
    currentParticipantId?: string,
    onAssigned: (participantId: string) => void
    onCancel: () => void
}

export function AssignParticipantIdForm({ mid, currentParticipantId, onAssigned, onCancel }: AssignParticipantIdFormProps) {
    const [participantId, setParticipantId] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmedParticipantId = participantId.trim()

        if (!trimmedParticipantId) {
            setError('Введите ID участника ЦР.')
            return
        }

        try {
            setError(null)
            setIsSubmitting(true)

            await assignParticipantId(mid, trimmedParticipantId)

            setParticipantId('')
            onAssigned(trimmedParticipantId)
        } catch (error) {
            setError(error instanceof Error? error.message : 'Не удалось назначить ID участника ЦР.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="modal-body">
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="client-form-mid">MID</label>

                        <div className="input-wrap">
                            <Fingerprint size={22} />

                            <input
                                id="client-form-mid"
                                className="locked mono"
                                value={mid}
                                readOnly
                                aria-readonly="true"
                            />
                        </div>

                        <div className="readonly-note">
                            Поле доступно только для чтения.
                        </div>
                    </div>
                    <div className="form-field">
                        <label htmlFor="client-participant-id">
                            ID участника ЦР
                        </label>

                        <div className="input-wrap">
                            <Landmark size={22} />

                            <input
                                id="client-participant-id"
                                className="mono"
                                value={currentParticipantId ?? ''}
                                onChange={(event) =>
                                    setParticipantId(event.target.value)
                                }
                                disabled={isSubmitting}
                                maxLength={100}
                                required
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}
            </div>

            <div className="modal-foot">
                <button
                    className="btn-secondary"
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Отмена
                </button>

                <button
                    className="btn-primary"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    )
}