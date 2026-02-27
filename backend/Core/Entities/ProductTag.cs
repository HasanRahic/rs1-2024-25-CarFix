namespace Core.Entities;

public class ProductTag : BaseEntity
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public ICollection<Product> Products { get; set; } = [];
}
