import { Component, inject } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
 accountService = inject(AccountService);
  private router = inject(Router);

  // theme
  isDark = localStorage.getItem('theme') === 'dark';

  toggleTheme() {
    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    // Najjednostavnije: class na body
    document.body.classList.toggle('dark-theme', this.isDark);
  }

  logout() {
    this.accountService.logout().subscribe({
      next: () =>{
        this.accountService.currentUser.set(null);
        this.router.navigateByUrl('/');
      }
    })
  }
}
