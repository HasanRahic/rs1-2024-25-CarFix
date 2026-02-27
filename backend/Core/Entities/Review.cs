namespace Core.Entities;

public class Review : BaseEntity
{
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public required string ReviewerEmail { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public int Rating { get; set; } // 1-5
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
