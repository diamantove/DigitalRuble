namespace Infrastructure.Identity;

public static class IdentityRoles
{
    public const string Operator = "Operator";
    public const string Admin = "Admin";

    public static readonly IReadOnlyCollection<string> All =
    [
        Operator,
        Admin
    ];
}