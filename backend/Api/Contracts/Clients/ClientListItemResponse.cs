namespace Api.Contracts.Clients;

public sealed record ClientListItemResponse(
    string Mid,
    string FullName,
    string? DigitalRubleParticipantId);
