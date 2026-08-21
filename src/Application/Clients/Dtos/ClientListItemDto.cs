namespace Application.Clients.Dtos;

public sealed record ClientListItemDto(
    string Mid,
    string FullName,
    string? DigitalRubleParticipantId);
