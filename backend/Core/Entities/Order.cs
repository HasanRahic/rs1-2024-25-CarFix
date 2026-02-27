namespace Core.Entities;

public class Order : BaseEntity
{
    public required string BuyerEmail { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public required ShipToAddress ShipToAddress { get; set; }
    public int DeliveryMethodId { get; set; }
    public DeliveryMethod? DeliveryMethod { get; set; }
    public List<OrderItem> OrderItems { get; set; } = [];
    public decimal Subtotal { get; set; }
    public string? PaymentIntentId { get; set; }

    public decimal GetTotal() => Subtotal + (DeliveryMethod?.Price ?? 0);
}

public enum OrderStatus
{
    Pending,
    PaymentReceived,
    PaymentFailed
}
