import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShopService } from '../../core/services/shop.service';
import { RouterLink } from '@angular/router';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';
import { MatCard, MatCardContent } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private shopService = inject(ShopService);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
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
      error: () => {},
    });
  }

  fullName = '';
  email = '';
  message = '';

  onSubmit(form: any) {
    if (!this.fullName || !this.email || !this.message) {
      this.snackBar.open('Molimo popunite sva polja.', 'OK', { duration: 3000 });
      return;
    }

    this.http.post(environment.apiUrl + 'contact', {
      fullName: this.fullName,
      email: this.email,
      message: this.message
    }).subscribe({
      next: () => {
        this.snackBar.open('Poruka je uspje\u0161no poslana!', 'OK', { duration: 3000 });
        form.resetForm();
      },
      error: () => {
        this.snackBar.open('Gre\u0161ka pri slanju poruke. Poku\u0161ajte ponovo.', 'Zatvori', { duration: 4000 });
      }
    });
  }
}
