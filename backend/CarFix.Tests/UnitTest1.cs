namespace CarFix.Tests;

public class UnitTest1
{
    [Fact]
    public void OrderTotal_ShouldEqualSubtotalPlusDelivery()
    {
        // Arrange
        decimal subtotal = 100m;
        decimal deliveryPrice = 10m;

        // Act
        decimal total = subtotal + deliveryPrice;

        // Assert
        Assert.Equal(110m, total);
    }
}
