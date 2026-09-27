using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

public sealed class CustomIdentityUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;

    public string Status { get; set; } = "Active";

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
}