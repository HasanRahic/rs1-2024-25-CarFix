import { Component, inject } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { CartService } from '../../core/services/cart.service';
import { AccountService } from '../../core/services/account.service';
import { ShopParams } from '../../shared/models/shopParams';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [MatCard, MatCardContent, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private shopService = inject(ShopService);
  cartService = inject(CartService);
  accountService = inject(AccountService);

  totalProducts = 0;

  ngOnInit(): void {
    const params = new ShopParams();
    params.pageSize = 1;
    params.pageNumber = 1;

    this.shopService.getProducts(params).subscribe({
      next: res => this.totalProducts = res.count,
      error: err => console.log(err)
    });
  }
}
