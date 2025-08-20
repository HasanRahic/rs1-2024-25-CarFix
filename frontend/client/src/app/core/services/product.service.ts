import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  baseUrl = 'https://localhost:5001/api/';
  baseImageUrl = 'https://localhost:5001';
  private http = inject(HttpClient);

  getProducts(
    pageIndex?: number,
    pageSize?: number
  ): Observable<Pagination<Product>> {
    let params = new HttpParams();

    if (pageIndex !== undefined && pageSize !== undefined) {
      params = params.set('pageIndex', pageIndex);
      params = params.set('pageSize', pageSize);
    }

    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', {
      params,
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(this.baseUrl + 'products/' + id);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl + 'products', product);
  }

  updateProduct(product: Product): Observable<void> {
    return this.http.put<void>(
      this.baseUrl + 'products/' + product.id,
      product
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'products/' + id);
  }

  uploadImage(file: FormData) {
    return this.http.post(this.baseUrl + 'products/upload', file, {
      responseType: 'text',
    });
  }
}
