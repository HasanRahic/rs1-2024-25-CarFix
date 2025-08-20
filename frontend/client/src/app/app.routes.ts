import { Routes } from '@angular/router';
import { LoginComponent } from './features/account/login/login.component';
import { RegisterComponent } from './features/account/register/register.component';
import { ShopComponent } from './features/shop/shop.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';

export const routes: Routes = [
  { path: '', component: ShopComponent },
  { path: 'shop', component: ShopComponent },
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
  }
];
