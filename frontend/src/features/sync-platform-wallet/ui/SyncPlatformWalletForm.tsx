import { useState, type SubmitEvent } from 'react'
import type { Client } from '../../../entities/client/model/types'
import type { WalletStatus } from '../../../entities/wallet/model/types'
import {syncPlatformWallet, type SyncPlatformWalletRequest} from '../api/syncPlatformWallet'
import { CreditCard, KeyRound, Activity, Fingerprint } from 'lucide-react'


type SyncPlatformWalletFormProps = {
    client: Client
    onSynced: () => Promise<void>
    onCancel: () => void
}

const statusOptions: Array<{value: WalletStatus, label: string}> = [
        { value: 'prcs', label: 'Ожидает открытия' },
        { value: 'actv', label: 'Активен' },
        { value: 'blck', label: 'Заблокирован' }
    ]

export function SyncPlatformWalletForm({ client, onSynced, onCancel }: SyncPlatformWalletFormProps) {
    const [walletCode, setWalletCode] = useState<string>('')
    const [status, setStatus] = useState<WalletStatus>('prcs')
    const [accountNumber, setAccountNumber] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmedWalletCode = walletCode.trim()
        const trimmedAccountNumber = accountNumber.trim()

        setError(null)
        setSuccess(null)

        if (!trimmedWalletCode) {
            setError('Введите код кошелька.')
            return
        }

        const request: SyncPlatformWalletRequest = {
            mid: client.mid,
            walletCode: trimmedWalletCode,
            status,
        }

        if (trimmedAccountNumber) {
            request.accountNumber = trimmedAccountNumber
        }

        try {
            setIsSubmitting(true)

            await syncPlatformWallet(request)
            await onSynced()

            setWalletCode('')
            setAccountNumber('')
            setSuccess('Данные кошелька синхронизированы.')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Не удалось синхронизировать кошелёк.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="modal-body">
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="sync-mid">MID клиента</label>
                        <div className="input-wrap">
                            <Fingerprint size={20} />
                            <input
                                id="sync-mid"
                                className="locked mono"
                                value={client.mid}
                                readOnly
                                />
                        </div>
                        <div className="readonly-note">
                            Поле доступно только для чтения.
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="sync-wallet-code">
                            Код кошелька
                        </label>
                        <div className="input-wrap">
                            <KeyRound size={22} aria-hidden="true" />

                            <input
                                id="sync-wallet-code"
                                className="mono"
                                value={walletCode}
                                onChange={(event) => setWalletCode(event.target.value)}
                                maxLength={100}
                                disabled={isSubmitting}
                                placeholder="Введите код кошелька"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="sync-wallet-status">
                            Статус
                        </label>

                        <div className="input-wrap">
                            <Activity size={22} aria-hidden="true" />

                            <select
                                id="sync-wallet-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value as WalletStatus)
                                }
                                disabled={isSubmitting}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="sync-account-number">
                            Номер счёта
                        </label>
                        <div className="input-wrap">
                            <CreditCard size={22} aria-hidden="true" />

                            <input
                                id="sync-account-number"
                                className="mono"
                                value={accountNumber}
                                onChange={(event) => setAccountNumber(event.target.value)}
                                maxLength={20}
                                disabled={isSubmitting}
                                placeholder="Введите номер счёта"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="form-success" role="status">
                        {success}
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
                    {isSubmitting ? 'Синхронизация...' : 'Создать кошелек'}
                </button>
            </div>
        </form>
    )
}