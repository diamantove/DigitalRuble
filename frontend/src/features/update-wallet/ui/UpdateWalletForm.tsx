import { useEffect, useState } from "react";
import type { Wallet, WalletStatus } from "../../../entities/wallet/model/types"
import { updateWallet } from "../api/updateWallet";
import type { SubmitEvent } from 'react';

type UpdateWalletFormProps = {
    wallet: Wallet,
    onUpdated: () => Promise<void>
}

export const statusOptions = [
    { value: 'prcs', label: 'Ожидает открытия' },
    { value: 'actv', label: 'Активен' },
    { value: 'blck', label: 'Заблокирован' },
    { value: 'clsd', label: 'Закрыт' },
] as const satisfies Array<{ value: WalletStatus; label: string }>;

export function UpdateWalletForm({wallet, onUpdated}: UpdateWalletFormProps) {
    const [status, setStatus] = useState<WalletStatus | ''>('')
    const [accountNumber, setAccountNumber] = useState<string>(wallet.accountNumber || '')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    useEffect(() => {
        setAccountNumber(wallet.accountNumber || '')
        setStatus('') 
    }, [wallet])

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmedAccountNumber = accountNumber.trim()

        if (!status && !trimmedAccountNumber) {
            setError('Выберите новый статус или введите номер счёта.')
            return
        }

        const request: {
            status?: WalletStatus
            accountNumber?: string
        } = {}

        if (status) {
            request.status = status
        }

        if (trimmedAccountNumber) {
            request.accountNumber = trimmedAccountNumber
        }

        try {
            setError(null)
            setIsSubmitting(true)

            await updateWallet(wallet.code, request)
            await onUpdated()

            setStatus('')
            setAccountNumber('')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Не удалось обновить кошелёк.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Новый статус
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as WalletStatus | '')}
                    disabled={isSubmitting}
                >
                    <option value="">Не менять</option>

                    {statusOptions.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.value === wallet.status}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            {<label>
                Номер счёта
                <input
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    disabled={isSubmitting}
                    maxLength={20}
                />
            </label>}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение…' : 'Сохранить'}
            </button>

            {error && <p role="alert">{error}</p>}
        </form>
    )
}