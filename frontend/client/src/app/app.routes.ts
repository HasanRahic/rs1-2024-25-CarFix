import { Routes } from '@angular/router';
import { LoginComponent } from './features/account/login/login.component';
import { RegisterComponent } from './features/account/register/register.component';
import { ShopComponent } from './features/shop/shop.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { CartComponent } from './features/cart/cart.component';
import { HomeComponent } from './features/home/home.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard]},
  { path: 'account/login', component: LoginComponent },
  { path: 'account/register', component: RegisterComponent },
  { 
    path: 'products', 
    children: [
      { path: '', component: ProductListComponent },
      { path: 'create', component: ProductFormComponent },
      { path: ':id', component: ProductListComponent },
      { path: 'edit/:id', component: ProductFormComponent } // Dodajte ovo
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
