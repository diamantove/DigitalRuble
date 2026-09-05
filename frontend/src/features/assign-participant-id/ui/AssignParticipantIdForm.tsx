import { useState, type SubmitEvent } from 'react'
import { assignParticipantId } from '../api/assignParticipantId'

type AssignParticipantIdFormProps = {
    mid: string
    onAssigned: (participantId: string) => void
}

export function AssignParticipantIdForm({mid, onAssigned}: AssignParticipantIdFormProps) {
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
            <label>
                ID участника ЦР
                <input
                    value={participantId}
                    onChange={(event) => setParticipantId(event.target.value)}
                    disabled={isSubmitting}
                    maxLength={100}
                    required
                />
            </label>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение…' : 'Назначить ID'}
            </button>

            {error && <p role="alert">{error}</p>}
        </form>
    )
}