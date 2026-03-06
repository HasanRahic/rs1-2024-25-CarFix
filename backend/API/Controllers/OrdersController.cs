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
            Status = OrderStatus.Pending
        };

        context.Orders.Add(order);
        await context.SaveChangesAsync();

        // Frontend reaches here only after stripe.confirmPayment() succeeded.
        // Fulfill directly on the already-tracked entities — avoids re-querying
        // the same EF Core context that just saved the order.
        if (!string.IsNullOrEmpty(order.PaymentIntentId))
        {
            order.Status = OrderStatus.PaymentReceived;

            foreach (var item in order.OrderItems)
            {
                var product = await context.Products.FindAsync(item.ProductId);
                if (product != null)
                    product.QuantityInStock = Math.Max(0, product.QuantityInStock - item.Quantity);
            }

            var buyer = await context.Users.FirstOrDefaultAsync(u => u.Email == order.BuyerEmail);
            if (buyer != null)
            {
                context.Notifications.Add(new Notification
                {
                    UserId = buyer.Id,
                    Title = "Narudžba potvrđena",
                    Message = $"Vaša narudžba #{order.Id} je uspješno plaćena i u obradi."
                });
            }

            await context.SaveChangesAsync();
        }

        await cartService.DeleteCartAsync(orderDto.CartId);

        return Ok(new OrderDto
        {
            Id = order.Id,
            BuyerEmail = order.BuyerEmail,
            OrderDate = order.OrderDate,
            Status = order.Status.ToString(),
            Subtotal = order.Subtotal,
            DeliveryPrice = deliveryMethod.Price,
            DeliveryMethodName = deliveryMethod.ShortName,
            Total = order.Subtotal + deliveryMethod.Price,
            PaymentIntentId = order.PaymentIntentId,
            Items = order.OrderItems.Select(i => new OrderItemDto
            {
                ProductName = i.ProductName,
                PictureUrl = i.PictureUrl,
                Price = i.Price,
                Quantity = i.Quantity
            }).ToList(),
            ShipToAddress = new ShipToAddressDto
            {
                FirstName = order.ShipToAddress.FirstName,
                LastName = order.ShipToAddress.LastName,
                Street = order.ShipToAddress.Street,
                City = order.ShipToAddress.City,
                State = order.ShipToAddress.State,
                PostalCode = order.ShipToAddress.PostalCode
            }
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
