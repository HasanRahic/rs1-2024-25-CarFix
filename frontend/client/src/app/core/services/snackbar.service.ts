import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private snackBar = inject(MatSnackBar);

  error(message: string): void {
    this.snackBar.open(message, 'Zatvori', { duration: 5000 });
  }

  success(message: string): void {
    this.snackBar.open(message, 'Zatvori', { duration: 3000 });
  }
}
