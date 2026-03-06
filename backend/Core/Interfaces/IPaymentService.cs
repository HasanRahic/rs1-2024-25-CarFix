using System;
using Core.Entities;

namespace Core.Interfaces;

public interface IPaymentService
{
    Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId);
    Task FulfillOrderAsync(string paymentIntentId);
    Task FailOrderAsync(string paymentIntentId);
}
