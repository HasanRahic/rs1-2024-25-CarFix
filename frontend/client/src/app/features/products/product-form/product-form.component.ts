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

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
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
        this.productForm.patchValue(product);

        if (product.pictureUrl) {
          if (product.pictureUrl.startsWith('/')) {
            this.previewUrl = 'https://localhost:5001' + product.pictureUrl;
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

  async onSubmit() {
    if (this.productForm.valid) {
      try {
        let pictureUrl = this.productForm.value.pictureUrl;

        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('file', this.selectedFile);
          pictureUrl = await this.productService
            .uploadImage(formData)
            .toPromise();
          console.log('Uploaded image URL:', pictureUrl);
        }

        const productData = { ...this.productForm.value, pictureUrl };
        console.log('Product data to create:', productData);

        if (this.isEditMode && this.product) {
          const updatedProduct: Product = {
            ...this.product,
            ...productData,
            id: this.product.id,
          };

          this.productService.updateProduct(updatedProduct).subscribe({
            next: () => {
              console.log('Product updated successfully');
              this.router.navigate(['/products']);
            },
            error: (error) => {
              console.error('Error updating product:', error);
            },
          });
        } else {
          this.productService.createProduct(productData).subscribe({
            next: (response) => {
              console.log('Product created successfully:', response);
              this.router.navigate(['/products']);
            },
            error: (error) => {
              console.error('Error creating product:', error);
            },
          });
        }
      } catch (err) {
        console.error('Error uploading or saving product:', err);
      }
    } else {
      console.log('Form is invalid:', this.productForm.errors);
      console.log('Form values:', this.productForm.value);
    }
  }

  onImageError(event: Event) {
    console.error('Image failed to load:', this.previewUrl);
    this.previewUrl = undefined;
  }
}
