import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notification } from '../../shared/models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  notifications = signal<Notification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  load() {
    return this.http.get<Notification[]>(this.baseUrl + 'notifications').subscribe({
      next: items => this.notifications.set(items)
    });
  }

  markAsRead(id: number) {
    this.http.patch(this.baseUrl + `notifications/${id}/read`, {}).subscribe({
      next: () => this.notifications.update(list =>
        list.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    });
  }

  markAllAsRead() {
    const unread = this.notifications().filter(n => !n.isRead);
    unread.forEach(n => this.markAsRead(n.id));
  }

  clear() {
    this.notifications.set([]);
  }
}
