import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Pagination } from '../../../shared/models/pagination';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, CommonModule, RouterLink, TruncatePipe, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  totalPages = 0;
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filter parameters (5 filters for CRUD form)
  searchTerm = '';
  brandFilter = '';
  typeFilter = '';
  sortFilter = '';
  minPriceFilter: number | null = null;

  private filterSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  get sortedProducts(): Product[] {
    return this.products;
  }

  // Maps column+direction to the sort values the backend understands
  private toSortParam(column: string, direction: 'asc' | 'desc'): string {
    if (column === 'price') return direction === 'asc' ? 'priceAsc' : 'priceDesc';
    return ''; // default = name asc on backend
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    // Sync the dropdown value so both controls stay in sync
    this.sortFilter = this.toSortParam(this.sortColumn, this.sortDirection);
    this.currentPage = 1;
    this.loadProducts();
  }

  pageBaseClass =
    'relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md';

  pageClassMap = {
    ellipsis: 'text-gray-500 cursor-default bg-white border-gray-300',
    active: 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10',
    normal:
      'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer',
  };

  ngOnInit(): void {
    // Live filter: debounce input changes before calling API
    this.filterSubject
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadProducts();
      });

    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['currentPage'] || 1;
      this.itemsPerPage = +params['itemsPerPage'] || 6;
      this.loadProducts();

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange(): void {
    // Sync sort column indicators when sort dropdown changes
    if (this.sortFilter === 'priceAsc') { this.sortColumn = 'price'; this.sortDirection = 'asc'; }
    else if (this.sortFilter === 'priceDesc') { this.sortColumn = 'price'; this.sortDirection = 'desc'; }
    else if (this.sortFilter === 'name') { this.sortColumn = 'name'; this.sortDirection = 'asc'; }
    this.filterSubject.next();
  }

  loadProducts() {
    this.productService
      .getProducts(
        this.currentPage,
        this.itemsPerPage,
        this.searchTerm || undefined,
        this.brandFilter || undefined,
        this.typeFilter || undefined,
        undefined,
        undefined,
        this.sortFilter || undefined
      )
      .subscribe({
        next: (response: Pagination<Product>) => {
          this.products = response.data;
          this.totalItems = response.count;
          this.updatePaginationInfo();
        },
        error: () => {},
      });
  }

  clearFilters() {
    this.searchTerm = '';
    this.brandFilter = '';
    this.typeFilter = '';
    this.sortFilter = '';
    this.minPriceFilter = null;
    this.currentPage = 1;
    this.sortColumn = 'name';
    this.sortDirection = 'asc';
    this.loadProducts();
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
    this.router.navigate(['/products/edit', productId], {
      queryParams: {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      },
    });
  }

  deleteProduct(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: 'Are you sure you want to delete this product? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
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
    });
  }
}
