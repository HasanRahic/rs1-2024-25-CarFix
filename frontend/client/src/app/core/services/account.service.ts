import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Address, User } from '../../shared/models/user';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  login(values: any) {
    return this.http
      .post<{ message: string }>(this.baseUrl + 'account/login', values, { withCredentials: true })
      .pipe(
        // Token is stored in httpOnly cookie by the server — no localStorage
        map(() => null)
      );
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values);
  }

  getUserInfo() {
    return this.http.get<User>(this.baseUrl + 'account/user-info').pipe(
      map((user) => {
        this.currentUser.set(user);
        return user;
      }),
    );
  }

  logout() {
    this.currentUser.set(null);
    return this.http.post(this.baseUrl + 'account/logout', {}, { withCredentials: true });
  }

  updateAddress(address: Address) {
    return this.http.post(this.baseUrl + 'account/address', address);
  }

  getAuthState() {
    return this.http.get<{ isAuthenticated: boolean }>(
      this.baseUrl + 'account/auth-status',
    );
  }

  updateProfile(profile: {
    firstName: string;
    lastName: string;
    description?: string;
  }) {
    return this.http.put(this.baseUrl + 'account/profile', profile);
  }
}
