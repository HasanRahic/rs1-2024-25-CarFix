import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  baseUrl = environment.apiUrl;
  baseImageUrl = environment.apiUrl.replace('/api/', '');
  private http = inject(HttpClient);

  getProducts(
    pageIndex?: number,
    pageSize?: number,
    search?: string,
    brand?: string,
    type?: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: string
  ): Observable<Pagination<Product>> {
    let params = new HttpParams();

    if (pageIndex !== undefined && pageSize !== undefined) {
      params = params.set('pageIndex', pageIndex);
      params = params.set('pageSize', pageSize);
    }
    if (search) params = params.set('search', search);
    if (brand) params = params.set('brands', brand);
    if (type) params = params.set('types', type);
    if (sort) params = params.set('sort', sort);

    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', {
      params,
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(this.baseUrl + 'products/' + id);
  }

  createProduct(product: any, file?: File) {
    const formData = new FormData();
    formData.append('Name', product.name);
    formData.append('Description', product.description);
    formData.append('Price', product.price?.toString() ?? '0');
    formData.append('Brand', product.brand);
    formData.append('Type', product.type);
    formData.append(
      'QuantityInStock',
      product.quantityInStock?.toString() ?? '0'
    );

    if (file) {
      formData.append('ImageFile', file, file.name);
    }

    return this.http.post(this.baseUrl + 'products', formData);
  }

  updateProduct(id: number, product: any) {
    return this.http.put(this.baseUrl + 'products/' + id, product);
  }

  updateProductImage(id: number, file: File) {
    const formData = new FormData();
    formData.append('ImageFile', file, file.name);
    return this.http.put(this.baseUrl + 'products/' + id + '/image', formData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'products/' + id);
  }
}
