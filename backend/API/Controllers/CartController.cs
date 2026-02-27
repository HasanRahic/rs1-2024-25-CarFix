using System;
using System.Linq;
using API.DTOs;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class CartController(ICartService cartService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<ShoppingCartDto>> GetCartById(string id)
    {
        var cart = await cartService.GetCartAsync(id) ?? new ShoppingCart { Id = id };
        return Ok(MapToDto(cart));
    }

    [HttpPost]
    public async Task<ActionResult<ShoppingCartDto>> UpdateCart(ShoppingCart cart)
    {
        var updatedCart = await cartService.SetCartAsync(cart);

        if (updatedCart == null) return BadRequest("Problem with cart");

        return Ok(MapToDto(updatedCart));
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteCart(string id)
    {
        var result = await cartService.DeleteCartAsync(id);

        if (!result) return BadRequest("Problem deleting cart");

        return Ok();
    }

    private static ShoppingCartDto MapToDto(ShoppingCart cart) => new ShoppingCartDto
    {
        Id = cart.Id,
        DeliveryMethodId = cart.DeliveryMethodId,
        ClientSecret = cart.ClientSecret,
        PaymentIntentId = cart.PaymentIntentId,
        Items = cart.Items.Select(i => new CartItemDto
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            Price = i.Price,
            Quantity = i.Quantity,
            PictureUrl = i.PictureUrl,
            Brand = i.Brand,
            Type = i.Type
        }).ToList()
    };
}
