using API.DTOs;
using API.Extensions;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class ReviewsController(StoreContext context) : BaseApiController
{
    [HttpGet("{productId:int}")]
    public async Task<ActionResult<IReadOnlyList<ReviewDto>>> GetProductReviews(int productId)
    {
        var reviews = await context.Reviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            ReviewerEmail = r.ReviewerEmail,
            Title = r.Title,
            Content = r.Content,
            Rating = r.Rating,
            CreatedAt = r.CreatedAt
        }));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto dto)
    {
        var product = await context.Products.FindAsync(dto.ProductId);
        if (product == null || product.IsDeleted) return NotFound("Proizvod nije pronađen.");

        var review = new Review
        {
            ProductId = dto.ProductId,
            ReviewerEmail = User.GetEmail(),
            Title = dto.Title,
            Content = dto.Content,
            Rating = dto.Rating
        };

        context.Reviews.Add(review);
        await context.SaveChangesAsync();

        return Ok(new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            ReviewerEmail = review.ReviewerEmail,
            Title = review.Title,
            Content = review.Content,
            Rating = review.Rating,
            CreatedAt = review.CreatedAt
        });
    }
}
