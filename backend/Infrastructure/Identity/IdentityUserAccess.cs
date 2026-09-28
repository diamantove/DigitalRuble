using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

public sealed class IdentityUserAccessService(UserManager<CustomIdentityUser> userManager)
    : IUserAccessService
{
    public async Task<bool> BlockAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());

        if (user is null)
        {
            return false;
        }

        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;

        var result = await userManager.UpdateSecurityStampAsync(user);

        return result.Succeeded;
    }

    public async Task<bool> UnblockAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return false;
        }

        user.LockoutEnd = null;
        user.AccessFailedCount = 0;

        var stampResult = await userManager.UpdateSecurityStampAsync(user);

        return stampResult.Succeeded;
    }

}