using System.ComponentModel.DataAnnotations;

namespace Api.Contracts.Clients;

public sealed record AssignParticipantIdRequest(
    [param: Required]
    [param: StringLength(100)]
    string DigitalRubleParticipantId
);
