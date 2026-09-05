import { apiClient } from '../../../shared/api/client'

type AssignParticipantIdRequest = {
    digitalRubleParticipantId: string
}

export function assignParticipantId(mid: string, digitalRubleParticipantId: string) {
    const request: AssignParticipantIdRequest = {
        digitalRubleParticipantId,
    }

    return apiClient.put<void>(`/clients/${encodeURIComponent(mid)}`, request)
}