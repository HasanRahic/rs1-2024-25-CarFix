namespace API.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public required string BuyerEmail { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "";
    public decimal Subtotal { get; set; }
    public decimal DeliveryPrice { get; set; }
    public decimal Total { get; set; }
    public string? PaymentIntentId { get; set; }
}
