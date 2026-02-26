import { Component, inject } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  accountService = inject(AccountService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  saving = false;
  saved = false;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],     // ✅ zaključano
    description: ['']
  });

  ngOnInit(): void {
    // 1) učitaj user
    this.accountService.getUserInfo().subscribe(user => {
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        description: user.description ?? ''
      });

      // 2) AUTOSAVE nakon što se forma napuni
      this.setupAutosave();
    });
  }

  private setupAutosave() {
    // autosave samo kada user mijenja vrijednosti (ne na init)
    this.form.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      filter(() => this.form.valid),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.saving = true;
      this.saved = false;

      const payload = {
        firstName: this.form.getRawValue().firstName!,
        lastName: this.form.getRawValue().lastName!,
        description: this.form.getRawValue().description ?? ''
      };

      this.accountService.updateProfile(payload).subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
          setTimeout(() => (this.saved = false), 1200);
          // refresh local currentUser info (da header itd. bude updated)
          this.accountService.getUserInfo().subscribe();
        },
        error: () => {
          this.saving = false;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
