package com.hema.hemspire.controller;

import com.hema.hemspire.entity.Video;
import com.hema.hemspire.service.FileStorageService;
import com.hema.hemspire.service.VideoService;
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
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final FileStorageService fileStorageService;

    @PostMapping(value = {"", "/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public Video uploadVideo(
            @RequestPart("title") String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        return videoService.uploadVideo(title, description, file);
    }

    @GetMapping
    public List<Video> getAllVideos() {
        return videoService.getAllVideos();
    }

    @GetMapping("/search")
    public List<Video> searchVideos(@RequestParam String keyword) {
        return videoService.searchVideos(keyword);
    }

    @GetMapping("/{id}")
    public Video getVideoById(@PathVariable Long id) {
        return videoService.getVideoById(id);
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Video likeVideo(@PathVariable Long id, Authentication authentication) {
        return videoService.toggleLikeVideo(id, authentication.getName());
    }

    @GetMapping("/likes/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<Long> getMyLikedVideoIds(Authentication authentication) {
        return videoService.getLikedVideoIds(authentication.getName());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public Video updateVideo(
            @PathVariable Long id,
            @RequestPart(value = "title", required = false) String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        return videoService.updateVideo(id, title, description, file);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadVideo(@PathVariable Long id) {
        Video video = videoService.getVideoById(id);
        Resource resource = fileStorageService.loadFileAsResource(video.getVideoPath());
        String filename = resource.getFilename();
        String downloadName = StringUtils.hasText(filename) ? filename : "video-file";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
