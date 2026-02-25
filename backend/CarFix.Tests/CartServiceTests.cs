using System.Text.Json;
using Core.Entities;
using Infrastructure.Services;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace CarFix.Tests;

public class CartServiceTests
{
    [Fact]
    public async Task GetCartAsync_ReturnsNull_WhenCartDoesNotExist()
    {
        // arrange
        var dbMock = new Mock<IDatabase>();
        dbMock.Setup(db => db.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
              .ReturnsAsync(RedisValue.Null);

        var redisMock = new Mock<IConnectionMultiplexer>();
        redisMock.Setup(r => r.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                 .Returns(dbMock.Object);

        var service = new CartService(redisMock.Object);

        // act
        var result = await service.GetCartAsync("non-existing-key");

        // assert
        Assert.Null(result);
    }

    [Fact]
    public async Task SetCartAsync_CallsRedisStringSet_WhenWriteSucceeds()
    {
        // arrange
        var cart = new ShoppingCart
        {
            Id = "cart_1",
            Items =
            [
                new CartItem
            {
                ProductId = 1,
                ProductName = "Test Product",
                Price = 10,
                Quantity = 2,
                PictureUrl = "pic.jpg",
                Brand = "Brand",
                Type = "Type"
            }
            ]
        };

        var dbMock = new Mock<IDatabase>();

        dbMock.Setup(db => db.StringSetAsync(
                It.IsAny<RedisKey>(),
                It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan>(),
                It.IsAny<bool>(),
                It.IsAny<When>(),
                It.IsAny<CommandFlags>()))
      .ReturnsAsync(true);

        var redisMock = new Mock<IConnectionMultiplexer>();
        redisMock.Setup(r => r.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                 .Returns(dbMock.Object);

        var service = new CartService(redisMock.Object);

        // act
        await service.SetCartAsync(cart);

        // assert (provjeri da je upisan u Redis)
        dbMock.Verify(db => db.StringSetAsync(
                It.IsAny<RedisKey>(),
                It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan>(),
                It.IsAny<bool>(),
                It.IsAny<When>(),
                It.IsAny<CommandFlags>()),
              Times.Once);
    }
}