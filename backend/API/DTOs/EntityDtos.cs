using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateReviewDto
{
    public int ProductId { get; set; }
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    [Range(1, 5)] public int Rating { get; set; }
}

public class ReviewDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ReviewerEmail { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FavouriteDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string PictureUrl { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; }
}

public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateServiceRequestDto
{
    [Required] public string VehicleMake { get; set; } = string.Empty;
    [Required] public string VehicleModel { get; set; } = string.Empty;
    [Range(1900, 2100)] public int VehicleYear { get; set; }
    [Required] public string ServiceType { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
}

public class ServiceRequestDto
{
    public int Id { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public int VehicleYear { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public DateTime? ScheduledAt { get; set; }
}

public class CouponDto
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public DateTime ExpiryDate { get; set; }
}
