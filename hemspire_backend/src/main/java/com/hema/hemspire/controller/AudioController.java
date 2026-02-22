package com.hema.hemspire.controller;

import com.hema.hemspire.entity.Audio;
import com.hema.hemspire.service.AudioService;
import com.hema.hemspire.service.FileStorageService;
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
@RequestMapping("/api/audios")
@RequiredArgsConstructor
public class AudioController {

    private final AudioService audioService;
    private final FileStorageService fileStorageService;

    @PostMapping(value = {"", "/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public Audio uploadAudio(
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        return audioService.uploadAudio(title, description, file);
    }

    @GetMapping
    public List<Audio> getAllAudios() {
        return audioService.getAllAudios();
    }

    @GetMapping("/search")
    public List<Audio> searchAudios(@RequestParam String keyword) {
        return audioService.searchAudios(keyword);
    }

    @GetMapping("/{id}")
    public Audio getAudioById(@PathVariable Long id) {
        return audioService.getAudioById(id);
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Audio likeAudio(@PathVariable Long id, Authentication authentication) {
        return audioService.toggleLikeAudio(id, authentication.getName());
    }

    @GetMapping("/likes/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<Long> getMyLikedAudioIds(Authentication authentication) {
        return audioService.getLikedAudioIds(authentication.getName());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public Audio updateAudio(
            @PathVariable Long id,
            @RequestPart(value = "title", required = false) String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        return audioService.updateAudio(id, title, description, file);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAudio(@PathVariable Long id) {
        audioService.deleteAudio(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadAudio(@PathVariable Long id) {
        Audio audio = audioService.getAudioById(id);
        Resource resource = fileStorageService.loadFileAsResource(audio.getAudioPath());
        String filename = resource.getFilename();
        String downloadName = StringUtils.hasText(filename) ? filename : "audio-file";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
