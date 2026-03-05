using Core.Entities;
using Core.Interfaces;
using Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace CarFix.Tests;

public class PaymentServiceTests
{
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<ICartService> _cartServiceMock;
    private readonly Mock<IGenericRepository<Product>> _productRepoMock;
    private readonly Mock<IGenericRepository<DeliveryMethod>> _dmRepoMock;
    private readonly PaymentService _paymentService;

    public PaymentServiceTests()
    {
        _configMock = new Mock<IConfiguration>();
        _configMock.Setup(c => c["StripeSettings:SecretKey"]).Returns("sk_test_placeholder");

        _cartServiceMock = new Mock<ICartService>();
        _productRepoMock = new Mock<IGenericRepository<Product>>();
        _dmRepoMock = new Mock<IGenericRepository<DeliveryMethod>>();

        _paymentService = new PaymentService(
            _configMock.Object,
            _cartServiceMock.Object,
            _productRepoMock.Object,
            _dmRepoMock.Object);
    }

    [Fact]
    public async Task CreateOrUpdatePaymentIntent_ReturnsNull_WhenCartNotFound()
    {
        // Arrange
        _cartServiceMock
            .Setup(cs => cs.GetCartAsync("missing-cart"))
            .ReturnsAsync((ShoppingCart?)null);

        // Act
        var result = await _paymentService.CreateOrUpdatePaymentIntent("missing-cart");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateOrUpdatePaymentIntent_ReturnsNull_WhenDeliveryMethodNotFound()
    {
        // Arrange
        var cart = new ShoppingCart
        {
            Id = "cart-1",
            DeliveryMethodId = 99,
            Items = new List<CartItem>
            {
                new CartItem { ProductId = 1, Price = 10, Quantity = 1, ProductName = "P1", PictureUrl = "", Brand = "B", Type = "T" }
            }
        };

        _cartServiceMock.Setup(cs => cs.GetCartAsync("cart-1")).ReturnsAsync(cart);
        _dmRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((DeliveryMethod?)null);

        // Act
        var result = await _paymentService.CreateOrUpdatePaymentIntent("cart-1");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateOrUpdatePaymentIntent_ReturnsNull_WhenProductNotFound()
    {
        // Arrange
        var cart = new ShoppingCart
        {
            Id = "cart-1",
            Items = new List<CartItem>
            {
                new CartItem { ProductId = 999, Price = 50, Quantity = 1, ProductName = "Ghost", PictureUrl = "", Brand = "B", Type = "T" }
            }
        };

        _cartServiceMock.Setup(cs => cs.GetCartAsync("cart-1")).ReturnsAsync(cart);
        _productRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Product?)null);

        // Act
        var result = await _paymentService.CreateOrUpdatePaymentIntent("cart-1");

        // Assert
        Assert.Null(result);
    }
}
