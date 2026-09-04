export function formatParticipantId(participantId: string | null): string {
  return participantId?.trim() || 'Нет'
}