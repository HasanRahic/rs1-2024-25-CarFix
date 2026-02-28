using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class OrdersController(StoreContext context, ICartService cartService) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto orderDto)
    {
        var cart = await cartService.GetCartAsync(orderDto.CartId);
        if (cart == null || cart.Items.Count == 0)
            return BadRequest("Korpa je prazna ili nije pronađena");

        var deliveryMethod = await context.DeliveryMethods.FindAsync(orderDto.DeliveryMethodId);
        if (deliveryMethod == null)
            return BadRequest("Metod dostave nije pronađen");

        var items = cart.Items.Select(i => new OrderItem
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            PictureUrl = i.PictureUrl,
            Price = i.Price,
            Quantity = i.Quantity
        }).ToList();

        var subtotal = items.Sum(i => i.Price * i.Quantity);

        var order = new Order
        {
            BuyerEmail = User.GetEmail(),
            ShipToAddress = new ShipToAddress
            {
                FirstName = orderDto.ShipToAddress.FirstName,
                LastName = orderDto.ShipToAddress.LastName,
                Street = orderDto.ShipToAddress.Street,
                City = orderDto.ShipToAddress.City,
                State = orderDto.ShipToAddress.State,
                PostalCode = orderDto.ShipToAddress.PostalCode
            },
            DeliveryMethodId = deliveryMethod.Id,
            OrderItems = items,
            Subtotal = subtotal,
            PaymentIntentId = cart.PaymentIntentId,
            Status = OrderStatus.PaymentReceived
        };

        context.Orders.Add(order);
        await context.SaveChangesAsync();

        await cartService.DeleteCartAsync(orderDto.CartId);

        return Ok(new OrderDto
        {
            Id = order.Id,
            BuyerEmail = order.BuyerEmail,
            OrderDate = order.OrderDate,
            Status = order.Status.ToString(),
            Subtotal = order.Subtotal,
            DeliveryPrice = deliveryMethod.Price,
            Total = order.Subtotal + deliveryMethod.Price,
            PaymentIntentId = order.PaymentIntentId
        });
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders()
    {
        var email = User.GetEmail();

        var orders = await context.Orders
            .Where(o => o.BuyerEmail == email)
            .Include(o => o.DeliveryMethod)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders.Select(o => new OrderDto
        {
            Id = o.Id,
            BuyerEmail = o.BuyerEmail,
            OrderDate = o.OrderDate,
            Status = o.Status.ToString(),
            Subtotal = o.Subtotal,
            DeliveryPrice = o.DeliveryMethod?.Price ?? 0,
            Total = o.GetTotal(),
            PaymentIntentId = o.PaymentIntentId
        }));
    }
}
