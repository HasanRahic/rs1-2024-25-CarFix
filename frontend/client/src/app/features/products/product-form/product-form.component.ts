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

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
      price: [0, Validators.required],
      type: ['', Validators.required],
      brand: ['', Validators.required],
      quantityInStock: [0, Validators.required],
      pictureUrl: [''],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
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
        console.error('Error loading product:', err);
        this.router.navigate(['/products']);
      },
    });
  }

  onSubmit() {
    if (!this.productForm.valid) {
      alert('Popuni sva polja!');
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
                  console.error('Greška prilikom ažuriranja slike:', err),
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
          console.error('Greška prilikom ažuriranja podataka:', err),
      });
    } else {
      this.productService.createProduct(product, this.selectedFile).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => console.error('Greška prilikom kreiranja:', err),
      });
    }
  }

  onImageError(event: Event) {
    console.error('Image failed to load:', this.previewUrl);
    this.previewUrl =
      'https://res.cloudinary.com/dgr65fixz/image/upload/v1761391917/products/u0etewaxj3sdckqfrczj.jpg';
  }
}
