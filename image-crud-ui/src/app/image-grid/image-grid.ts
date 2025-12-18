import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService, Image } from '../Service/imageService';

@Component({
  selector: 'app-image-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.css']
})
export class ImageGridComponent implements OnInit {
  images: Image[] = [];
  selectedFile?: File;
  isLoading = false;
  isUploading = false;
  error: string | null = null;
  successMessage: string | null = null;
  dragOver = false;
  editingImageId: number | null = null;

  // Allowed file types
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages() {
    this.isLoading = true;
    this.error = null;
    this.imageService.getAll().subscribe({
      next: (data) => {
        this.images = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load images. Please try again.';
        this.isLoading = false;
        console.error('Error loading images:', err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.validateFile(file)) {
      this.selectedFile = file;
      this.error = null;
    }
  }

  validateFile(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      this.error = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.error = 'File size must be less than 5MB';
      return false;
    }

    return true;
  }

  upload() {
    if (this.selectedFile && !this.isUploading) {
      this.isUploading = true;
      this.error = null;

      if (this.editingImageId) {
        // UPDATE operation
        this.imageService.update(this.editingImageId, this.selectedFile).subscribe({
          next: () => {
            this.successMessage = 'Image updated successfully!';
            this.resetForm();
            this.loadImages();
          },
          error: (err) => {
            this.error = 'Failed to update image. Please try again.';
            this.isUploading = false;
            console.error('Error updating image:', err);
          }
        });
      } else {
        // CREATE operation
        this.imageService.upload(this.selectedFile).subscribe({
          next: () => {
            this.successMessage = 'Image uploaded successfully!';
            this.resetForm();
            this.loadImages();
          },
          error: (err) => {
            this.error = 'Failed to upload image. Please try again.';
            this.isUploading = false;
            console.error('Error uploading image:', err);
          }
        });
      }
    }
  }

  private resetForm() {
    this.selectedFile = undefined;
    this.isUploading = false;
    this.editingImageId = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  deleteImage(id: number) {
    if (confirm('Are you sure you want to delete this image?')) {
      this.imageService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Image deleted successfully!';
          this.loadImages();
        },
        error: (err) => {
          this.error = 'Failed to delete image. Please try again.';
          console.error('Error deleting image:', err);
        }
      });
    }
  }

  // Download image
  downloadImage(image: Image) {
    this.imageService.download(image);
    this.successMessage = `Downloading ${image.fileName}...`;
  }

  // Start editing an image
  startEdit(image: Image) {
    this.editingImageId = image.id;
    this.successMessage = `Select a new file to replace "${image.fileName}"`;
    this.error = null;
    // Scroll to upload section
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Cancel edit mode
  cancelEdit() {
    this.editingImageId = null;
    this.selectedFile = undefined;
    this.successMessage = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  getImageSrc(image: Image): string {
    return `data:image/jpeg;base64,${image.data}`;
  }

  // Drag and drop functionality
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.error = null;
      }
    }
  }

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.successMessage = null;
  }

  trackByImageId(index: number, image: Image): number {
    return image.id;
  }
}
