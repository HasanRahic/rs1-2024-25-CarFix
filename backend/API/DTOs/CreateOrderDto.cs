namespace API.DTOs;

public class CreateOrderDto
{
    public required string CartId { get; set; }
    public int DeliveryMethodId { get; set; }
    public required ShipAddressDto ShipToAddress { get; set; }
}

public class ShipAddressDto
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Street { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string PostalCode { get; set; }
}
