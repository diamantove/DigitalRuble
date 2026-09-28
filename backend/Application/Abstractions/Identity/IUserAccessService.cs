public interface IUserAccessService
{
    Task<bool> BlockAsync(Guid userId);

    Task<bool> UnblockAsync(Guid userId);
}