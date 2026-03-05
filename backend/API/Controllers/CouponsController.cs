using API.DTOs;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class CouponsController(StoreContext context) : BaseApiController
{
    [HttpGet("{code}")]
    public async Task<ActionResult<CouponDto>> GetCoupon(string code)
    {
        var coupon = await context.Coupons
            .FirstOrDefaultAsync(c => c.Code == code && c.IsActive && c.ExpiryDate > DateTime.UtcNow);

        if (coupon == null) return NotFound("Kupon nije pronađen ili je istekao.");

        return Ok(new CouponDto
        {
            Code = coupon.Code,
            DiscountPercent = coupon.DiscountPercent,
            ExpiryDate = coupon.ExpiryDate
        });
    }
}
