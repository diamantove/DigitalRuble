import { useState, type SubmitEvent } from 'react'
import type { Client } from '../../../entities/client/model/types'
import type { WalletStatus } from '../../../entities/wallet/model/types'
import {syncPlatformWallet, type SyncPlatformWalletRequest} from '../api/syncPlatformWallet'

type SyncPlatformWalletFormProps = {
    client: Client
    onSynced: () => Promise<void>
}

const statusOptions: Array<{value: WalletStatus, label: string}> = [
        { value: 'prcs', label: 'Ожидает открытия' },
        { value: 'actv', label: 'Активен' },
        { value: 'blck', label: 'Заблокирован' },
        { value: 'clsd', label: 'Закрыт' },
    ]

export function SyncPlatformWalletForm({client, onSynced}: SyncPlatformWalletFormProps) {
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
            <h2>Синхронизация с платформой ЦР</h2>

            <label>
                MID клиента
                <input value={client.mid} readOnly />
            </label>

            <label>
                Код кошелька
                <input
                    value={walletCode}
                    onChange={(event) => setWalletCode(event.target.value)}
                    maxLength={100}
                    disabled={isSubmitting}
                    required
                />
            </label>

            <label>
                Статус
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as WalletStatus)}
                    disabled={isSubmitting}
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Номер счёта
                <input
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    maxLength={20}
                    disabled={isSubmitting}
                />
            </label>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Синхронизация…' : 'Синхронизировать'}
            </button>

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </form>
    )
}