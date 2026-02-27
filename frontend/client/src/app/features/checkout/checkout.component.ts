import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AccountService } from '../../core/services/account.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type DeliveryMethod = {
  id: number;
  shortName: string;
  deliveryTime: string;
  description: string;
  price: number;
};

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private http = inject(HttpClient);

  currentStep = 1; // 1=Address, 2=Delivery, 3=Review, 4=Success
  deliveryMethods: DeliveryMethod[] = [];
  selectedDeliveryMethod: DeliveryMethod | null = null;
  isSubmitting = false;
  orderConfirmed = false;

  addressForm!: FormGroup;

  ngOnInit() {
    this.addressForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
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
    this.http.get<DeliveryMethod[]>(environment.apiUrl + 'orders/delivery-methods').subscribe({
      next: methods => this.deliveryMethods = methods,
      error: () => {
        // Fallback if endpoint doesn't exist yet
        this.deliveryMethods = [
          { id: 1, shortName: 'Standard', deliveryTime: '5-7 days', description: 'Standard delivery', price: 5 },
          { id: 2, shortName: 'Express', deliveryTime: '2-3 days', description: 'Express delivery', price: 10 },
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
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  placeOrder() {
    if (!this.addressForm.valid || !this.selectedDeliveryMethod) return;
    this.isSubmitting = true;

    // Simulate order placement (Stripe not configured yet)
    setTimeout(() => {
      this.isSubmitting = false;
      this.currentStep = 4;
      this.orderConfirmed = true;
      // Clear cart after order
      const cart = this.cartService.cart();
      if (cart) {
        this.http.delete(environment.apiUrl + 'cart?id=' + cart.id).subscribe();
        this.cartService.cart.set(null);
      }
    }, 1500);
  }
}
