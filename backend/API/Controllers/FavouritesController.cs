using API.DTOs;
using API.Extensions;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class FavouritesController(StoreContext context) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FavouriteDto>>> GetFavourites()
    {
        var userId = User.GetUserId();
        var favourites = await context.Favourites
            .Where(f => f.UserId == userId)
            .Include(f => f.Product)
            .OrderByDescending(f => f.AddedAt)
            .ToListAsync();

        return Ok(favourites.Select(f => new FavouriteDto
        {
            Id = f.Id,
            ProductId = f.ProductId,
            ProductName = f.Product?.Name ?? string.Empty,
            ProductPrice = f.Product?.Price ?? 0,
            PictureUrl = f.Product?.PictureUrl ?? string.Empty,
            AddedAt = f.AddedAt
        }));
    }

    [HttpPost("{productId:int}")]
    public async Task<ActionResult> AddFavourite(int productId)
    {
        var userId = User.GetUserId();

        var exists = await context.Favourites
            .AnyAsync(f => f.UserId == userId && f.ProductId == productId);

        if (exists) return BadRequest("Proizvod je već u omiljenim.");

        var product = await context.Products.FindAsync(productId);
        if (product == null || product.IsDeleted) return NotFound("Proizvod nije pronađen.");

        context.Favourites.Add(new Favourite
        {
            UserId = userId,
            ProductId = productId
        });

        await context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{productId:int}")]
    public async Task<ActionResult> RemoveFavourite(int productId)
    {
        var userId = User.GetUserId();

        var favourite = await context.Favourites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

        if (favourite == null) return NotFound();

        context.Favourites.Remove(favourite);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
