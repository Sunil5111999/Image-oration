import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Image {
  id: number;
  fileName: string;
  data: string; // Base64 string
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://localhost:8080/api/images';
  private mockImages: Image[] = [];
  private nextId = 1;
  private useMockData = false; // Set to true for mock data, false for real backend

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize with some sample images for demo (only used in mock mode)
    if (this.useMockData) {
      this.initializeSampleImages();
    }
  }

  private initializeSampleImages() {
    // Add some sample base64 images for demo purposes
    // Using simple base64 encoded 1x1 pixel images to avoid SSR issues
    const sampleImages = [
      {
        id: this.nextId++,
        fileName: 'sample1.jpg',
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // Red pixel
      },
      {
        id: this.nextId++,
        fileName: 'sample2.jpg',
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // Green pixel
      }
    ];
    this.mockImages = sampleImages;
  }

  private generateSampleImageBase64(text: string, color: string): string {
    // Only generate sample images in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return ''; // Return empty string for SSR
    }

    // Create a simple colored rectangle as base64 for demo
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 300, 200);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, 150, 100);
    }

    return canvas.toDataURL('image/jpeg').split(',')[1];
  }

  upload(file: File): Observable<Image> {
    if (this.useMockData) {
      return new Observable(observer => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          const newImage: Image = {
            id: this.nextId++,
            fileName: file.name,
            data: base64
          };
          this.mockImages.push(newImage);

          // Simulate network delay
          setTimeout(() => {
            observer.next(newImage);
            observer.complete();
          }, 1000);
        };
        reader.onerror = () => {
          observer.error(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    } else {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.post<Image>(this.apiUrl, formData);
    }
  }

  getAll(): Observable<Image[]> {
    if (this.useMockData) {
      // Simulate network delay
      return of([...this.mockImages]).pipe(delay(500));
    } else {
      return this.http.get<Image[]>(this.apiUrl);
    }
  }

  delete(id: number): Observable<void> {
    if (this.useMockData) {
      const index = this.mockImages.findIndex(img => img.id === id);
      if (index > -1) {
        this.mockImages.splice(index, 1);
        return of(void 0).pipe(delay(300));
      } else {
        return throwError(() => new Error('Image not found'));
      }
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
  }

  // Get single image by ID
  getById(id: number): Observable<Image> {
    if (this.useMockData) {
      const image = this.mockImages.find(img => img.id === id);
      if (image) {
        return of(image).pipe(delay(300));
      } else {
        return throwError(() => new Error('Image not found'));
      }
    } else {
      return this.http.get<Image>(`${this.apiUrl}/${id}`);
    }
  }

  // Update image by ID
  update(id: number, file: File): Observable<Image> {
    if (this.useMockData) {
      return new Observable(observer => {
        const index = this.mockImages.findIndex(img => img.id === id);
        if (index === -1) {
          observer.error(new Error('Image not found'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          this.mockImages[index] = {
            ...this.mockImages[index],
            fileName: file.name,
            data: base64
          };
          setTimeout(() => {
            observer.next(this.mockImages[index]);
            observer.complete();
          }, 500);
        };
        reader.onerror = () => {
          observer.error(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    } else {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.put<Image>(`${this.apiUrl}/${id}`, formData);
    }
  }

  // Download image - triggers browser download
  download(image: Image): void {
    if (isPlatformBrowser(this.platformId)) {
      // For both mock and real backend, use the base64 data we already have
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${image.data}`;
      link.download = image.fileName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Download image from server (alternative method using download endpoint)
  downloadFromServer(id: number, fileName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const downloadUrl = `${this.apiUrl}/download/${id}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Method to switch between mock and real backend
  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
  }
}
