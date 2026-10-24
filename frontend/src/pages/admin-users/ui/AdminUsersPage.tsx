import { useState } from 'react'
import { Plus, RefreshCw, UserRound } from 'lucide-react'

import { useAdminUsersQuery } from '../../../entities/user/api/useAdminUsersQuery'
import { useOperatorMutations } from '../../../features/manage-operators/model/useOperatorMutations'
import { CreateOperatorModal } from '../../../features/manage-operators/ui/CreateOperatorModal'
import { Modal } from '../../../shared/ui/modal'

export function AdminUsersPage() {
    const usersQuery = useAdminUsersQuery()
    const mutations = useOperatorMutations()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [pendingAction, setPendingAction] = useState<{
        id: string
        name: string
        blocked: boolean
    } | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const users = usersQuery.data ?? []
    const isChangingStatus = mutations.block.isPending || mutations.unblock.isPending

    async function confirmStatusChange() {
        if (!pendingAction) return

        try {
            setActionError(null)
            if (pendingAction.blocked) {
                await mutations.unblock.mutateAsync(pendingAction.id)
            } else {
                await mutations.block.mutateAsync(pendingAction.id)
            }

            setSuccessMessage(pendingAction.blocked ? 'Оператор разблокирован.' : 'Оператор заблокирован.')
            setPendingAction(null)
        } catch (error) {
            setActionError(error instanceof Error ? error.message : 'Не удалось изменить статус.')
        }
    }

    if (usersQuery.isPending) {
        return (
            <main className="page-state" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <span>Загрузка списка операторов...</span>
            </main>
        )
    }

    if (usersQuery.isError) {
        return (
            <main className="page-state">
                <h1>Не удалось загрузить операторов</h1>
                <p role="alert">{usersQuery.error.message}</p>
                <button
                    className="btn-primary"
                    type="button"
                    onClick={() => void usersQuery.refetch()}
                >
                    Повторить
                </button>
            </main>
        )
    }

    return (
        <main className="page">
            <section className="admin-heading">
                <div>
                    <p className="eyebrow">Администрирование</p>
                    <h1 className="client-title">Управление операторами</h1>
                    <p className="section-subtitle">
                        Создавайте учётные записи и управляйте доступом операторов.
                    </p>
                </div>

                <div className="admin-actions">
                    <button
                        className="icon-btn"
                        type="button"
                        aria-label="Обновить список операторов"
                        title="Обновить"
                        disabled={usersQuery.isFetching}
                        onClick={() => void usersQuery.refetch()}
                    >
                        <RefreshCw
                            size={19}
                            className={usersQuery.isFetching ? 'icon-spin' : undefined}
                        />
                    </button>
                    <button
                        className="btn-primary"
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus size={18} aria-hidden="true" />
                        Добавить оператора
                    </button>
                </div>
            </section>

            <section className="card admin-users-card" aria-labelledby="users-title">
                <div className="wallets-head">
                    <div>
                        <h2 className="wallets-title" id="users-title">Операторы</h2>
                        <p className="wallets-subtitle">
                            {`${users.length} ${users.length % 10 === 1 && users.length % 100 !== 11
                                ? 'учётная запись' : users.length % 10 >= 2 
                                && users.length % 10 <= 4 && (users.length % 100 < 10 || users.length % 100 >= 20) 
                                ? 'учётные записи' : 'учётных записей'}`}
                        </p>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="empty">
                        <UserRound size={28} aria-hidden="true" />
                        <p>Операторов пока нет.</p>
                        <p>Создайте первую учётную запись для сотрудника.</p>
                    </div>
                ) : (
                    <div className="table-wrap admin-users-table-wrap">
                        <table className="admin-users-table">
                            <thead>
                                <tr>
                                    <th scope="col">Оператор</th>
                                    <th scope="col">Роль</th>
                                    <th scope="col">Статус</th>
                                    <th scope="col"><span className="visually-hidden">Действие</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="admin-user-row">
                                        <td>
                                            <span className="admin-user-name">{user.displayName}</span>
                                            <span className="admin-user-email">{user.email}</span>
                                        </td>
                                        <td>{user.roles.map((role) => role === 'Operator' ? 'Оператор' : role).join(', ')}</td>
                                        <td>
                                            <span className={`status-pill ${user.isBlocked ? 'status-inactive' : 'status-active'}`}>
                                                <span className="status-dot" aria-hidden="true" />
                                                {user.isBlocked ? 'Заблокирован' : 'Активен'}
                                            </span>
                                        </td>
                                        <td className="admin-user-action">
                                            <button
                                                className="btn-secondary"
                                                type="button"
                                                disabled={isChangingStatus}
                                                onClick={() => {
                                                    setActionError(null)
                                                    setPendingAction({
                                                        id: user.id,
                                                        name: user.displayName,
                                                        blocked: user.isBlocked,
                                                    })
                                                }}
                                            >
                                                {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="admin-user-cards">
                            {users.map((user) => (
                                <article className="admin-user-card" key={user.id}>
                                    <div className="admin-user-card-heading">
                                        <div>
                                            <h3 className="admin-user-name">{user.displayName}</h3>
                                            <p className="admin-user-email">{user.email}</p>
                                        </div>
                                        <span className={`status-pill ${user.isBlocked ? 'status-inactive' : 'status-active'}`}>
                                            <span className="status-dot" aria-hidden="true" />
                                            {user.isBlocked ? 'Заблокирован' : 'Активен'}
                                        </span>
                                    </div>
                                    <p className="admin-user-role">
                                        {user.roles.map((role) => role === 'Operator' ? 'Оператор' : role).join(', ')}
                                    </p>
                                    <button
                                        className="btn-secondary admin-user-card-action"
                                        type="button"
                                        disabled={isChangingStatus}
                                        onClick={() => {
                                            setActionError(null)
                                            setPendingAction({
                                                id: user.id,
                                                name: user.displayName,
                                                blocked: user.isBlocked,
                                            })
                                        }}
                                    >
                                        {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {isCreateOpen && (
                <CreateOperatorModal
                    onClose={() => setIsCreateOpen(false)}
                    onCreated={() => {
                        setIsCreateOpen(false)
                        setSuccessMessage('Учётная запись оператора создана.')
                    }}
                />
            )}

            {pendingAction && (
                <Modal
                    title={pendingAction.blocked ? 'Разблокировать оператора?' : 'Заблокировать оператора?'}
                    subtitle={`${pendingAction.name} — ${pendingAction.blocked ? 'доступ к системе будет восстановлен' : 'доступ к системе будет закрыт'}.`}
                    onClose={() => setPendingAction(null)}
                >
                    {actionError && <p className="form-error" role="alert">{actionError}</p>}
                    <div className="modal-foot">
                        <button className="btn-secondary" type="button" onClick={() => setPendingAction(null)}>
                            Отмена
                        </button>
                        <button
                            className="btn-primary"
                            type="button"
                            disabled={isChangingStatus}
                            onClick={() => void confirmStatusChange()}
                        >
                            {isChangingStatus ? 'Сохранение…' : pendingAction.blocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                    </div>
                </Modal>
            )}

            <div className="visually-hidden" role="status" aria-live="polite">
                {successMessage ?? ''}
            </div>
        </main>
    )
}