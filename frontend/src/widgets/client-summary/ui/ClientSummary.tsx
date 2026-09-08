import { Fingerprint, Landmark, Pencil, UserRoundCheck } from 'lucide-react'

import { formatParticipantId } from '../../../entities/client/lib/formatParticipantId'
import type { Client } from '../../../entities/client/model/types'

type ClientSummaryProps = {
    client: Client
    onEdit: () => void
}

export function ClientSummary({client, onEdit}: ClientSummaryProps) {
    return (
        <section className="card client-header">
            <div className="client-header-row">
                <div className="client-identity">
                    <div className="identity-icon"> 
                        <UserRoundCheck size={22} />
                    </div>

                    <div>
                        <div className="eyebrow">Клиент</div>
                        <h1 className="client-title">{client.fullName}</h1>
                    </div>
                </div>

                <div className="head-actions">
                    <button
                        className="btn-secondary"
                        type="button"
                        onClick={onEdit}
                    >
                        <Pencil size={14} />
                        Изменить
                    </button>
                </div>
            </div>

            <div className="info-grid">
                <div className="info-item">
                    <div className="info-label">
                        <Fingerprint size={13} />
                        MID
                    </div>

                    <div className="info-value mono">{client.mid}</div>
                </div>

                <div className="info-item">
                    <div className="info-label">
                        <Landmark size={13} />
                        Digital Ruble ID
                    </div>

                    <div className="info-value mono">
                        {formatParticipantId(client.digitalRubleParticipantId)}
                    </div>
                </div>
            </div>
        </section>
    )
}