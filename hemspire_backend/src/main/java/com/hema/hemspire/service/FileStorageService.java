package com.hema.hemspire.service;

import com.hema.hemspire.exception.BadRequestException;
import com.hema.hemspire.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.InvalidPathException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootPath;

    @PostConstruct
    public void init() throws IOException {
        rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(rootPath);
    }

    public String saveFile(MultipartFile file, String folder, Set<String> allowedExtensions) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (!StringUtils.hasText(originalFilename)) {
            throw new BadRequestException("Invalid file name");
        }

        String extension = extractExtension(originalFilename);
        if (!allowedExtensions.contains(extension.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Unsupported file type");
        }

        Path folderPath = rootPath.resolve(folder).normalize();
        if (!folderPath.startsWith(rootPath)) {
            throw new BadRequestException("Invalid upload path");
        }
        Files.createDirectories(folderPath);

        String safeBaseName = sanitizeFileName(removeExtension(originalFilename));
        String storedName = UUID.randomUUID() + "_" + safeBaseName + "." + extension;
        Path targetPath = folderPath.resolve(storedName).normalize();

        if (!targetPath.startsWith(folderPath)) {
            throw new BadRequestException("Invalid target file path");
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return folder + "/" + storedName;
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            for (Path rootCandidate : getLoadRootCandidates()) {
                Path filePath = rootCandidate.resolve(relativePath).normalize();
                if (!filePath.startsWith(rootCandidate)) {
                    continue;
                }

                Resource resource = new UrlResource(filePath.toUri());
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            }

            throw new ResourceNotFoundException("File not found");
        } catch (Exception ex) {
            if (ex instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new ResourceNotFoundException("File not found");
        }
    }

    public void deleteFileIfExists(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return;
        }

        String normalizedInput = relativePath.trim();
        // Remote providers (e.g. Cloudinary URLs) are not local filesystem paths.
        if (normalizedInput.startsWith("http://") || normalizedInput.startsWith("https://")) {
            return;
        }

        try {
            Path filePath = rootPath.resolve(normalizedInput).normalize();
            if (filePath.startsWith(rootPath)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException | InvalidPathException ignored) {
        }
    }

    private String extractExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot <= 0 || lastDot == fileName.length() - 1) {
            throw new BadRequestException("File extension is required");
        }
        return fileName.substring(lastDot + 1);
    }

    private String removeExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return fileName.substring(0, lastDot);
    }

    private String sanitizeFileName(String value) {
        String sanitized = value.replaceAll("[^a-zA-Z0-9-_]", "_");
        return sanitized.length() > 80 ? sanitized.substring(0, 80) : sanitized;
    }

    private List<Path> getLoadRootCandidates() {
        List<Path> candidates = new ArrayList<>();
        candidates.add(rootPath);

        Path userDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        candidates.add(userDir.resolve("uploads").normalize());
        candidates.add(userDir.resolve("hemspire_backend").resolve("uploads").normalize());

        Path dirName = userDir.getFileName();
        if (dirName != null && "hemspire_backend".equalsIgnoreCase(dirName.toString()) && userDir.getParent() != null) {
            candidates.add(userDir.getParent().resolve("uploads").normalize());
        }

        return candidates;
    }
}
