namespace Core.Entities;

public class Notification : BaseEntity
{
    public required string UserId { get; set; }
    public AppUser? User { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
