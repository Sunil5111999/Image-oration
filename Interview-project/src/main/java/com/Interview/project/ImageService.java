package com.Interview.project;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    // Constructor injection for repository
    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    // CREATE - Save new image
    public Image saveImage(MultipartFile file) throws IOException {
        Image img = new Image();
        img.setFileName(file.getOriginalFilename());
        img.setData(file.getBytes());
        return imageRepository.save(img);
    }

    // READ - Get all images
    public List<Image> getAll() {
        return imageRepository.findAll();
    }

    // READ - Get single image by ID
    public Optional<Image> getById(Long id) {
        return imageRepository.findById(id);
    }

    // UPDATE - Update existing image
    public Optional<Image> updateImage(Long id, MultipartFile file) throws IOException {
        Optional<Image> existingImage = imageRepository.findById(id);

        if (existingImage.isPresent()) {
            Image img = existingImage.get();
            img.setFileName(file.getOriginalFilename());
            img.setData(file.getBytes());
            return Optional.of(imageRepository.save(img));
        }

        return Optional.empty();
    }

    // DELETE - Delete image by ID
    public void delete(Long id) {
        imageRepository.deleteById(id);
    }
}