import { useState } from "react";
import type { Wallet, WalletStatus } from "../../../entities/wallet/model/types"
import { updateWallet } from "../api/updateWallet";
import type { SubmitEvent } from 'react';
import { isAllowedWalletStatusTransition } from "../../../entities/wallet/lib/getAllowedWalletStatusTransitions";
import { getWalletStatusMeta } from "../../../entities/wallet/lib/getWalletStatusMeta";

type UpdateWalletFormProps = {
    wallet: Wallet,
    onUpdated: () => Promise<void>
    onCancel: () => void
}

const statusOptions = [
    { value: 'prcs', label: 'Ожидает открытия' },
    { value: 'actv', label: 'Активен' },
    { value: 'blck', label: 'Заблокирован' },
    { value: 'clsd', label: 'Закрыт' },
] as const satisfies Array<{ value: WalletStatus; label: string }>;

export function UpdateWalletForm({ wallet, onUpdated, onCancel }: UpdateWalletFormProps) {
    const [status, setStatus] = useState<WalletStatus | ''>('')
    const [accountNumber, setAccountNumber] = useState<string>(wallet.accountNumber || '')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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
            <div className="modal-body">
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="update-wallet-code">
                            Код кошелька
                        </label>

                        <input
                            id="update-wallet-code"
                            className="locked mono"
                            value={wallet.code}
                            readOnly
                        />

                        <div className="readonly-note">
                            Поле доступно только для чтения.
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="update-wallet-status">
                            Статус
                        </label>

                        <select
                            id="update-wallet-status"
                            value={status}
                            onChange={(event) => setStatus(event.target.value as WalletStatus)}
                            disabled={isSubmitting}
                        >
                            <option value="">Не менять статус</option>

                            {statusOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={!isAllowedWalletStatusTransition(wallet.status, option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}

                        </select>
                            <div className="readonly-note">
                                <p>Текущий статус: {getWalletStatusMeta(wallet.status).label}</p>
                            </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="update-account-number">
                            Номер счёта
                        </label>

                        <input
                            id="update-account-number"
                            className="mono"
                            value={accountNumber}
                            onChange={(event) => setAccountNumber(event.target.value)}
                            disabled={isSubmitting}
                            maxLength={20}
                        />
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
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
        </form>
    )
}