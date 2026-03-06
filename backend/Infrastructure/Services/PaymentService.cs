using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class PaymentService(
    IConfiguration config,
    ICartService cartService,
    IGenericRepository<Core.Entities.Product> productRepo,
    IGenericRepository<DeliveryMethod> dmRepo,
    StoreContext dbContext,
    UserManager<AppUser> userManager) : IPaymentService
{
    public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];

        var cart = await cartService.GetCartAsync(cartId);

        if (cart == null) return null;

        var shippingPrice = 0m;

        if (cart.DeliveryMethodId.HasValue)
        {
            var DeliveryMethod = await dmRepo.GetByIdAsync((int)cart.DeliveryMethodId);

            if (DeliveryMethod == null) return null;

            shippingPrice = DeliveryMethod.Price;
        }

        foreach (var item in cart.Items)
        {
            var productItem = await productRepo.GetByIdAsync(item.ProductId);

            if (productItem == null) return null;

            if (item.Price != productItem.Price)
            {
                item.Price = productItem.Price;
            }
        }

        var service = new PaymentIntentService();
        PaymentIntent? intent = null;

        if (!string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            // Check if the existing PaymentIntent is still usable before updating it.
            // If it was already confirmed, cancelled, or belongs to a different Stripe
            // account (e.g. after key rotation), reset it so a fresh one is created.
            try
            {
                var existing = await service.GetAsync(cart.PaymentIntentId);
                if (existing.Status is "succeeded" or "canceled")
                {
                    cart.PaymentIntentId = null;
                    cart.ClientSecret = null;
                }
            }
            catch (StripeException)
            {
                cart.PaymentIntentId = null;
                cart.ClientSecret = null;
            }
        }

        var amount = (long)cart.Items.Sum(x => x.Quantity * (x.Price * 100)) + (long)shippingPrice * 100;

        if (string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = amount,
                Currency = "usd",
                PaymentMethodTypes = ["card"]
            };
            intent = await service.CreateAsync(options);
            cart.PaymentIntentId = intent.Id;
            cart.ClientSecret = intent.ClientSecret;
        }
        else
        {
            var options = new PaymentIntentUpdateOptions
            {
                Amount = amount
            };
            intent = await service.UpdateAsync(cart.PaymentIntentId, options);
        }

        await cartService.SetCartAsync(cart);

        return cart;
    }

    public async Task FulfillOrderAsync(string paymentIntentId)
    {
        var order = await dbContext.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentIntentId);

        if (order == null || order.Status == OrderStatus.PaymentReceived) return;

        order.Status = OrderStatus.PaymentReceived;

        foreach (var item in order.OrderItems)
        {
            var product = await dbContext.Products.FindAsync(item.ProductId);
            if (product != null)
                product.QuantityInStock = Math.Max(0, product.QuantityInStock - item.Quantity);
        }

        var buyer = await userManager.FindByEmailAsync(order.BuyerEmail);
        if (buyer != null)
        {
            dbContext.Notifications.Add(new Notification
            {
                UserId = buyer.Id,
                Title = "Narudžba potvrđena",
                Message = $"Vaša narudžba #{order.Id} je uspješno plaćena i u obradi."
            });
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task FailOrderAsync(string paymentIntentId)
    {
        var order = await dbContext.Orders
            .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentIntentId);

        if (order == null || order.Status == OrderStatus.PaymentFailed) return;

        order.Status = OrderStatus.PaymentFailed;
        await dbContext.SaveChangesAsync();
    }
}
