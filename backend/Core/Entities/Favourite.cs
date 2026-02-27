namespace Core.Entities;

public class Favourite : BaseEntity
{
    public required string UserId { get; set; }
    public AppUser? User { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
