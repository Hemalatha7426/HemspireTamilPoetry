package com.hema.hemspire.controller;

import com.hema.hemspire.entity.Poem;
import com.hema.hemspire.service.FileStorageService;
import com.hema.hemspire.service.PoemService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/poems")
@RequiredArgsConstructor
public class PoemController {

    private final PoemService poemService;
    private final FileStorageService fileStorageService;

    @PostMapping(value = {"", "/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public Poem uploadPoem(
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        return poemService.uploadPoem(title, description, file);
    }

    @GetMapping
    public List<Poem> getAllPoems() {
        return poemService.getAllPoems();
    }

    @GetMapping("/search")
    public List<Poem> searchPoems(@RequestParam String keyword) {
        return poemService.searchPoems(keyword);
    }

    @GetMapping("/{id}")
    public Poem getPoemById(@PathVariable Long id) {
        return poemService.getPoemById(id);
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Poem likePoem(@PathVariable Long id, Authentication authentication) {
        return poemService.toggleLikePoem(id, authentication.getName());
    }

    @GetMapping("/likes/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<Long> getMyLikedPoemIds(Authentication authentication) {
        return poemService.getLikedPoemIds(authentication.getName());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public Poem updatePoem(
            @PathVariable Long id,
            @RequestPart(value = "title", required = false) String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        return poemService.updatePoem(id, title, description, file);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePoem(@PathVariable Long id) {
        poemService.deletePoem(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadPoemImage(@PathVariable Long id) {
        Poem poem = poemService.getPoemById(id);
        Resource resource = fileStorageService.loadFileAsResource(poem.getImagePath());

        String filename = resource.getFilename();
        String downloadName = StringUtils.hasText(filename) ? filename : "poem-image";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
