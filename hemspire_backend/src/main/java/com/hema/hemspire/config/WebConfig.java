package com.hema.hemspire.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Set<String> locations = new LinkedHashSet<>();
        for (Path path : getUploadLocationCandidates()) {
            String location = path.toUri().toString();
            locations.add(location.endsWith("/") ? location : location + "/");
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locations.toArray(new String[0]));
    }

    private List<Path> getUploadLocationCandidates() {
        List<Path> candidates = new ArrayList<>();
        Path configured = Paths.get(uploadDir).toAbsolutePath().normalize();
        candidates.add(configured);

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
