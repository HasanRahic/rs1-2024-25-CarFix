namespace Core.Entities;

public class Coupon : BaseEntity
{
    public required string Code { get; set; }
    public decimal DiscountPercent { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int UsageLimit { get; set; } = 1;
    public int TimesUsed { get; set; } = 0;
}
