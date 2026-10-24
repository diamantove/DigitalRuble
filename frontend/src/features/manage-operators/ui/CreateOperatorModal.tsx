import { useState, type FormEvent } from 'react'

import { useOperatorMutations } from '../model/useOperatorMutations'
import { Modal } from '../../../shared/ui/modal'

type Props = {
    onClose: () => void
    onCreated: () => void
}

export function CreateOperatorModal({ onClose, onCreated }: Props) {
    const { create } = useOperatorMutations()
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        try {
            await create.mutateAsync({
                displayName: displayName.trim(),
                email: email.trim(),
                password,
            })
            onCreated()
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Не удалось создать оператора.')
        }
    }

    return (
        <Modal
            title="Новый оператор"
            subtitle="Создайте учётную запись для оператора."
            onClose={onClose}
        >
            <form className="modal-body" onSubmit={(event) => void handleSubmit(event)}>
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="operator-name">Имя и фамилия</label>
                        <input
                            id="operator-name"
                            name="name"
                            autoComplete="name"
                            maxLength={100}
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="operator-email">Электронная почта</label>
                        <input
                            id="operator-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            maxLength={100}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="operator-password">Пароль</label>
                        <input
                            id="operator-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        <p className="readonly-note">
                            Требования к паролю проверит сервер при создании учётной записи.
                        </p>
                    </div>
                </div>

                {error && <p className="form-error" role="alert">{error}</p>}

                <div className="modal-foot">
                    <button className="btn-secondary" type="button" onClick={onClose}>
                        Отмена
                    </button>
                    <button className="btn-primary" type="submit" disabled={create.isPending}>
                        {create.isPending ? 'Создание...' : 'Создать оператора'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}