import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId?: number;
  selectedFile?: File;
  previewUrl?: string;
  product?: Product;
  currentPage?: number;
  itemsPerPage?: number;
  isDragging = false;

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackbarService = inject(SnackbarService);

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.currentPage = +this.route.snapshot.queryParams['currentPage'] || 1;
    this.itemsPerPage = +this.route.snapshot.queryParams['itemsPerPage'] || 6;
    this.isEditMode = !!this.productId;

    this.initializeForm();

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      type: ['', Validators.required],
      brand: ['', Validators.required],
      quantityInStock: [null, [Validators.required, Validators.min(1)]],
      pictureUrl: [''],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  loadProduct(id: number): void {
    this.productService.getProduct(id).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          brand: product.brand,
          type: product.type,
          quantityInStock: product.quantityInStock,
        });

        if (product.pictureUrl) {
          if (product.pictureUrl.startsWith('/images')) {
            this.previewUrl =
              'https://res.cloudinary.com/dgr65fixz/image/upload/v1761391917/products/u0etewaxj3sdckqfrczj.jpg';
          } else {
            this.previewUrl = product.pictureUrl;
          }
        }
      },
      error: (err) => {
        this.snackbarService.error('Greška pri učitavanju proizvoda.');
        this.router.navigate(['/products']);
      },
    });
  }

  onSubmit() {
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId!, product).subscribe({
        next: () => {
          if (this.selectedFile) {
            this.productService
              .updateProductImage(this.productId!, this.selectedFile!)
              .subscribe({
                next: () =>
                  this.router.navigate(['/products'], {
                    queryParams: {
                      currentPage: this.currentPage,
                      itemsPerPage: this.itemsPerPage,
                    },
                    skipLocationChange: true,
                  }),
                error: (err) =>
                  this.snackbarService.error('Greška pri ažuriranju slike.'),
              });
          } else {
            this.router.navigate(['/products'], {
              queryParams: {
                currentPage: this.currentPage,
                itemsPerPage: this.itemsPerPage,
              },
              skipLocationChange: true,
            });
          }
        },
        error: (err) =>
          this.snackbarService.error('Greška pri ažuriranju podataka.'),
      });
    } else {
      this.productService.createProduct(product, this.selectedFile).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => {
          const message = err?.error?.errors
            ? Object.values(err.error.errors).flat().join(' ')
            : (err?.error?.message ?? 'Greška prilikom kreiranja proizvoda.');
          this.snackbarService.error(message);
        },
      });
    }
  }

  onImageError(event: Event) {
    this.previewUrl =
      'https://res.cloudinary.com/dgr65fixz/image/upload/v1761391917/products/u0etewaxj3sdckqfrczj.jpg';
  }
}
