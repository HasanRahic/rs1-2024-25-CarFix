import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CartType } from '../../shared/models/cart';

export type DeliveryMethod = {
  id: number;
  shortName: string;
  deliveryTime: string;
  description: string;
  price: number;
};

export type CreateOrderRequest = {
  cartId: string;
  deliveryMethodId: number;
  shipToAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
};

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getDeliveryMethods() {
    return this.http.get<DeliveryMethod[]>(this.baseUrl + 'payments/delivery-methods');
  }

  createOrUpdatePaymentIntent(cartId: string) {
    return this.http.post<CartType>(this.baseUrl + 'payments/' + cartId, {});
  }

  createOrder(orderData: CreateOrderRequest) {
    return this.http.post(this.baseUrl + 'orders', orderData);
  }
}

