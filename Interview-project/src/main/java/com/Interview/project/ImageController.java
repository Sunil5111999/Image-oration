package com.Interview.project;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/images")
@CrossOrigin("*")  // Allow Angular to call APIs
public class ImageController {

    private final ImageService imageService;

    // Constructor injection
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // CREATE - Upload new image
    @PostMapping
    public ResponseEntity<Image> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(imageService.saveImage(file));
    }

    // READ - Get all images
    @GetMapping
    public ResponseEntity<List<Image>> getAll() {
        return ResponseEntity.ok(imageService.getAll());
    }

    // READ - Get single image by ID
    @GetMapping("/{id}")
    public ResponseEntity<Image> getById(@PathVariable Long id) {
        Optional<Image> image = imageService.getById(id);
        return image.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE - Update image by ID
    @PutMapping("/{id}")
    public ResponseEntity<Image> update(@PathVariable Long id,
                                         @RequestParam("file") MultipartFile file) throws IOException {
        Optional<Image> updatedImage = imageService.updateImage(id, file);
        return updatedImage.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - Delete image by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        imageService.delete(id);
        return ResponseEntity.ok().build();
    }

    // DOWNLOAD - Download image as file
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        Optional<Image> imageOpt = imageService.getById(id);

        if (imageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Image image = imageOpt.get();
        String contentType = getContentType(image.getFileName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("attachment", image.getFileName());
        headers.setContentLength(image.getData().length);

        return new ResponseEntity<>(image.getData(), headers, HttpStatus.OK);
    }

    // Helper method to determine content type from filename
    private String getContentType(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".png")) {
            return "image/png";
        } else if (lowerName.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerName.endsWith(".webp")) {
            return "image/webp";
        } else if (lowerName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        return "application/octet-stream";
    }
}