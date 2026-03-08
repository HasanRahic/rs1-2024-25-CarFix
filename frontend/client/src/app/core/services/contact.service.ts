import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type ContactMessage = {
  fullName: string;
  email: string;
  message: string;
};

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  sendMessage(data: ContactMessage) {
    return this.http.post(this.baseUrl + 'contact', data);
  }
}
