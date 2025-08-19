import { Routes } from '@angular/router';
import { LoginComponent } from './features/account/login/login.component';
import { RegisterComponent } from './features/account/register/register.component';
import { ShopComponent } from './features/shop/shop.component';

export const routes: Routes = [
    {path: '', component: ShopComponent},
    {path: 'shop', component: ShopComponent},
    {path: 'account/login', component: LoginComponent},
    {path: 'account/register', component: RegisterComponent}
];
