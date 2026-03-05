using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Entities;
using Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace CarFix.Tests;

public class TokenServiceTests
{
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<UserManager<AppUser>> _userManagerMock;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        _configMock = new Mock<IConfiguration>();
        _configMock.Setup(c => c["JwtSettings:SecretKey"])
                   .Returns("super-secret-key-for-unit-testing-purposes-only-1234567890");
        _configMock.Setup(c => c["JwtSettings:Issuer"]).Returns("test-issuer");
        _configMock.Setup(c => c["JwtSettings:Audience"]).Returns("test-audience");

        var store = new Mock<IUserStore<AppUser>>();
        _userManagerMock = new Mock<UserManager<AppUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        _userManagerMock
            .Setup(um => um.GetRolesAsync(It.IsAny<AppUser>()))
            .ReturnsAsync(new List<string> { "Customer" });

        _tokenService = new TokenService(_configMock.Object, _userManagerMock.Object);
    }

    [Fact]
    public async Task GenerateToken_ReturnsNonEmptyString()
    {
        // Arrange
        var user = new AppUser { Id = "u1", Email = "test@test.com", UserName = "test@test.com", FirstName = "Test", LastName = "User" };

        // Act
        var token = await _tokenService.GenerateToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public async Task GenerateToken_TokenContainsEmailClaim()
    {
        // Arrange
        var user = new AppUser { Id = "u1", Email = "ana@test.com", UserName = "ana@test.com", FirstName = "Ana", LastName = "Kovač" };

        // Act
        var token = await _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        Assert.Contains(jwt.Claims, c => c.Type == ClaimTypes.Email && c.Value == "ana@test.com");
    }

    [Fact]
    public async Task GenerateToken_TokenContainsRoleClaim()
    {
        // Arrange
        var user = new AppUser { Id = "u1", Email = "test@test.com", UserName = "test@test.com" };

        // Act
        var token = await _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        Assert.Contains(jwt.Claims, c => c.Type == ClaimTypes.Role && c.Value == "Customer");
    }

    [Fact]
    public async Task GenerateToken_TokenIsNotExpiredImmediately()
    {
        // Arrange
        var user = new AppUser { Id = "u1", Email = "test@test.com", UserName = "test@test.com" };

        // Act
        var token = await _tokenService.GenerateToken(user);

        // Assert — token should expire in 7 days, so it must be valid right now
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        Assert.True(jwt.ValidTo > DateTime.UtcNow);
    }

    [Fact]
    public async Task GenerateToken_TokenContainsUserIdClaim()
    {
        // Arrange
        var user = new AppUser { Id = "user-id-42", Email = "test@test.com", UserName = "test@test.com" };

        // Act
        var token = await _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        Assert.Contains(jwt.Claims, c => c.Type == ClaimTypes.NameIdentifier && c.Value == "user-id-42");
    }
}
