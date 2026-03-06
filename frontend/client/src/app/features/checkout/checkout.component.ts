import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AccountService } from '../../core/services/account.service';
import { CheckoutService, DeliveryMethod } from '../../core/services/checkout.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

export type OrderReceiptItem = {
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
};

export type OrderReceipt = {
  id: number;
  orderDate: string;
  subtotal: number;
  deliveryPrice: number;
  deliveryMethodName: string;
  total: number;
  items: OrderReceiptItem[];
  shipToAddress: {
    firstName: string; lastName: string;
    street: string; city: string; state: string; postalCode: string;
  };
};
@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private accountService = inject(AccountService);
  private checkoutService = inject(CheckoutService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentStep = 1; // 1=Address, 2=Delivery, 3=Payment, 4=Success
  deliveryMethods: DeliveryMethod[] = [];
  selectedDeliveryMethod: DeliveryMethod | null = null;
  isSubmitting = false;
  paymentError: string | null = null;
  completedOrder: OrderReceipt | null = null;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  addressForm!: FormGroup;

  ngOnInit() {
    this.addressForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });

    this.loadDeliveryMethods();
    this.prefillAddress();
  }

  prefillAddress() {
    const user = this.accountService.currentUser();
    if (user?.address) {
      this.addressForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        street: user.address.line1,
        city: user.address.city,
        state: user.address.state,
        postalCode: user.address.postalCode,
      });
    }
  }

  loadDeliveryMethods() {
    this.checkoutService.getDeliveryMethods().subscribe({
      next: methods => this.deliveryMethods = methods,
      error: () => {
        // Fallback if endpoint doesn't exist yet
        this.deliveryMethods = [
          { id: 1, shortName: 'Standard', deliveryTime: '5-7 dana', description: 'Standardna dostava', price: 5 },
          { id: 2, shortName: 'Express', deliveryTime: '2-3 dana', description: 'Express dostava', price: 10 },
        ];
      }
    });
  }

  selectDeliveryMethod(method: DeliveryMethod) {
    this.selectedDeliveryMethod = method;
  }

  get cartSubtotal() {
    return this.cartService.totals()?.subtotal ?? 0;
  }

  get deliveryPrice() {
    return this.selectedDeliveryMethod?.price ?? 0;
  }

  get orderTotal() {
    return this.cartSubtotal + this.deliveryPrice;
  }

  nextStep() {
    if (this.currentStep === 1 && this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    if (this.currentStep === 2 && !this.selectedDeliveryMethod) {
      return;
    }
    this.currentStep++;

    if (this.currentStep === 3) {
      setTimeout(() => this.initStripe(), 150);
    }
  }

  private async initStripe() {
    const cart = this.cartService.cart();
    if (!cart) return;

    try {
      // Re-sync the cart to Redis before creating/updating the payment intent.
      // This prevents a 400 if the backend was restarted and Redis lost the cart data
      // while the browser tab remained open with a stale in-memory cart.
      const syncedCart = await firstValueFrom(this.cartService.syncCart(cart));

      const updatedCart = await firstValueFrom(
        this.checkoutService.createOrUpdatePaymentIntent(syncedCart.id)
      );
      if (!updatedCart.clientSecret) return;

      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (!this.stripe) return;

      this.elements = this.stripe.elements({ clientSecret: updatedCart.clientSecret });
      const paymentElement = this.elements.create('payment', {
        paymentMethodOrder: ['card'],
        wallets: { applePay: 'never', googlePay: 'never' }
      });
      paymentElement.mount('#payment-element');
    } catch (err: any) {
      this.paymentError = err?.message ?? 'Greška pri inicijalizaciji platnog sustava.';
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onPostalCodeKeypress(event: KeyboardEvent): boolean {
    return /\d/.test(event.key);
  }

  async placeOrder() {
    if (!this.stripe || !this.elements) return;
    this.isSubmitting = true;
    this.paymentError = null;

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      redirect: 'if_required'
    });

    if (error) {
      this.paymentError = error.message ?? 'Plaćanje nije uspjelo. Pokušajte ponovo.';
      this.isSubmitting = false;
      return;
    }

    const cart = this.cartService.cart();
    if (!cart) {
      this.isSubmitting = false;
      return;
    }

    const orderData = {
      cartId: cart.id,
      deliveryMethodId: this.selectedDeliveryMethod!.id,
      shipToAddress: {
        firstName: this.addressForm.value.firstName,
        lastName: this.addressForm.value.lastName,
        street: this.addressForm.value.street,
        city: this.addressForm.value.city,
        state: this.addressForm.value.state,
        postalCode: this.addressForm.value.postalCode
      }
    };

    this.checkoutService.createOrder(orderData).subscribe({
      next: (order: any) => {
        this.completedOrder = order as OrderReceipt;
        this.cartService.cart.set(null);
        this.notificationService.load();
        this.isSubmitting = false;
        this.currentStep = 4;
      },
      error: (err) => {
        this.paymentError = 'Plaćanje je uspjelo, ali narudžba nije kreirana. Kontaktirajte podršku.';
        this.isSubmitting = false;
      }
    });
  }
}
