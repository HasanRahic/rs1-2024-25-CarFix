namespace Core.Entities;

public class ServiceRequest : BaseEntity
{
    public required string CustomerEmail { get; set; }
    public required string VehicleMake { get; set; }
    public required string VehicleModel { get; set; }
    public int VehicleYear { get; set; }
    public required string ServiceType { get; set; }
    public required string Description { get; set; }
    public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Pending;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ScheduledAt { get; set; }
}

public enum ServiceRequestStatus
{
    Pending,
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}
