import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AccountService } from '../../core/services/account.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  imports: [MatIcon, MatButton, MatBadge, RouterLink, MatMenuTrigger, MatMenu, MatDivider, MatMenuItem, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  accountService = inject(AccountService);
  private router = inject(Router);
  cartService = inject(CartService);

  logout(){
    this.accountService.logout().subscribe({
      next: () =>{
        this.accountService.currentUser.set(null);
        this.router.navigateByUrl('/');
      }
    })
  }

  ngOnInit(): void {
    this.accountService.getUserInfo().subscribe({
      error: err => console.log('No user found', err)
    });
  }
}
