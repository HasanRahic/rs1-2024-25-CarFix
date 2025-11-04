import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';
import { MatCard, MatCardContent } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private shopService = inject(ShopService);
  products: Product[] = [];

  get types(): string[] {
    return this.shopService.types;
  }
  get brands(): string[] {
    return this.shopService.brands;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.shopService.getTypes();
    this.shopService.getBrands();
  }

  private loadProducts() {
    const params: ShopParams = {
      brands: [],
      types: [],
      sort: '',
      search: '',
      pageSize: 8,
      pageNumber: 1,
    };

    this.shopService.getProducts(params).subscribe({
      next: (resp: any) => (this.products = resp?.data ?? []),
      error: (err) => console.error(err),
    });
  }

  fullName = '';
  email = '';
  message = '';

  onSubmit(form: any) {
    console.log('Slanje poruke:', {
      fullName: this.fullName,
      email: this.email,
      message: this.message,
    });

    form.resetForm();

    alert('Poruka je poslana! 💬');
  }
}
