import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Pagination } from '../../../shared/models/pagination';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  private productService = inject(ProductService);
  private router = inject(Router);

  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  totalPages = 0;

  pageBaseClass =
    'relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md';

  pageClassMap = {
    ellipsis: 'text-gray-500 cursor-default bg-white border-gray-300',
    active: 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10',
    normal:
      'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer',
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService
      .getProducts(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response: Pagination<Product>) => {
          this.products = response.data;
          this.totalItems = response.count;
          this.updatePaginationInfo();
          console.log('Products loaded:', this.products);
        },
        error: (err) => console.error(err),
      });
  }

  updatePaginationInfo() {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== -1) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  getVisiblePages(): number[] {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, this.currentPage - delta);
      i <= Math.min(this.totalPages - 1, this.currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages);
    } else if (this.totalPages > 1) {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i);
  }

  editProduct(productId: number) {
    this.router.navigate(['/products/edit', productId]);
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter((p) => p.id !== id);
          this.totalItems--;
          this.updatePaginationInfo();

          if (this.products.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadProducts();
          }
        },
      });
    }
  }
}
