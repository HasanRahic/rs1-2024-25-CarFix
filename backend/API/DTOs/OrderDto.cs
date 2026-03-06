namespace API.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public required string BuyerEmail { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "";
    public decimal Subtotal { get; set; }
    public decimal DeliveryPrice { get; set; }
    public string DeliveryMethodName { get; set; } = "";
    public decimal Total { get; set; }
    public string? PaymentIntentId { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
    public ShipToAddressDto? ShipToAddress { get; set; }
}

public class OrderItemDto
{
    public string ProductName { get; set; } = "";
    public string PictureUrl { get; set; } = "";
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class ShipToAddressDto
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Street { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string PostalCode { get; set; } = "";
}
