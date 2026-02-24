package com.hema.hemspire.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hema.hemspire.exception.BadRequestException;
import com.hema.hemspire.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.enforce:false}")
    private boolean cloudinaryEnforce;

    private Path rootPath;
    private Cloudinary cloudinary;
    private boolean cloudinaryEnabled;

    @PostConstruct
    public void init() throws IOException {
        rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(rootPath);
        initializeCloudinary();
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

        String safeBaseName = sanitizeFileName(removeExtension(originalFilename));
        String uniqueName = UUID.randomUUID() + "_" + safeBaseName;

        if (cloudinaryEnabled) {
            try {
                return saveToCloudinary(file, folder, uniqueName);
            } catch (Exception ex) {
                if (cloudinaryEnforce) {
                    throw new IOException("Cloudinary upload failed while enforcement is enabled", ex);
                }
                log.warn("Cloudinary upload failed. Falling back to local storage. reason={}", ex.getMessage());
            }
        }

        if (cloudinaryEnforce) {
            throw new IOException("Cloudinary enforcement is enabled but Cloudinary is not available");
        }

        return saveLocally(file, folder, uniqueName, extension);
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            if (isRemoteUrl(relativePath)) {
                return new UrlResource(relativePath);
            }

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
        if (isRemoteUrl(normalizedInput)) {
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

    private String saveLocally(MultipartFile file, String folder, String uniqueName, String extension) throws IOException {
        Path folderPath = rootPath.resolve(folder).normalize();
        if (!folderPath.startsWith(rootPath)) {
            throw new BadRequestException("Invalid upload path");
        }
        Files.createDirectories(folderPath);

        String storedName = uniqueName + "." + extension;
        Path targetPath = folderPath.resolve(storedName).normalize();

        if (!targetPath.startsWith(folderPath)) {
            throw new BadRequestException("Invalid target file path");
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return folder + "/" + storedName;
    }

    private String saveToCloudinary(MultipartFile file, String folder, String uniqueName) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", folder,
                        "public_id", uniqueName
                )
        );

        Object secureUrl = result.get("secure_url");
        if (secureUrl == null || !StringUtils.hasText(secureUrl.toString())) {
            throw new IOException("Cloudinary upload succeeded but did not return a URL");
        }
        return secureUrl.toString();
    }

    private void initializeCloudinary() {
        if (!StringUtils.hasText(cloudName) || !StringUtils.hasText(apiKey) || !StringUtils.hasText(apiSecret)) {
            if (cloudinaryEnforce) {
                throw new IllegalStateException("Cloudinary enforcement is enabled but credentials are missing");
            }
            cloudinaryEnabled = false;
            return;
        }

        try {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            cloudinaryEnabled = true;
        } catch (Exception ex) {
            if (cloudinaryEnforce) {
                throw new IllegalStateException("Cloudinary enforcement is enabled but initialization failed", ex);
            }
            cloudinaryEnabled = false;
            log.warn("Cloudinary initialization failed. Local file storage will be used. reason={}", ex.getMessage());
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

    private boolean isRemoteUrl(String value) {
        return StringUtils.hasText(value) && (value.startsWith("http://") || value.startsWith("https://"));
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
