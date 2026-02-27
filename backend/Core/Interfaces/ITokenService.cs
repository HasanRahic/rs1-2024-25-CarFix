using Core.Entities;

namespace Core.Interfaces;

public interface ITokenService
{
    Task<string> GenerateToken(AppUser user);
}
