import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AccountService } from '../../core/services/account.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [MatIcon, MatButton, MatIconButton, MatBadge, RouterLink, MatMenuTrigger, MatMenu,
            MatDivider, MatMenuItem, RouterLinkActive, DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  accountService = inject(AccountService);
  private router = inject(Router);
  cartService = inject(CartService);
  notificationService = inject(NotificationService);

  logout() {
    this.accountService.logout().subscribe({
      next: () => {
        this.accountService.currentUser.set(null);
        this.notificationService.clear();
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnInit(): void {
    this.accountService.getUserInfo().subscribe({
      next: () => {
        if (this.accountService.currentUser()) {
          this.notificationService.load();
        }
      }
    });
  }
}
