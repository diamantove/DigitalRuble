using Api.Contracts.Clients;
using Application.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin/clients")]
[Authorize(Policy = "AdminAccess")]
public sealed class AdminClientsController(ClientService clientService) 
    : ControllerBase
{
    [HttpPut("{mid}/participant-id")]
    public async Task<IActionResult> UpdateParticipantId(
        string mid,
        [FromBody] AssignParticipantIdRequest request,
        CancellationToken cancellationToken)
    {
        await clientService.UpdateDigitalRubleParticipantIdAsync(
            mid,
            request.DigitalRubleParticipantId,
            cancellationToken);

        return NoContent();
    }
}