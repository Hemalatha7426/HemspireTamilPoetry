package com.hema.hemspire.service;

import com.hema.hemspire.entity.Video;
import com.hema.hemspire.entity.User;
import com.hema.hemspire.exception.ResourceNotFoundException;
import com.hema.hemspire.repository.VideoRepository;
import com.hema.hemspire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private static final Set<String> VIDEO_EXTENSIONS = Set.of("mp4", "avi", "mov", "mkv", "webm");

    public Video uploadVideo(String title, String description, MultipartFile file) throws IOException {
        validateTitle(title);
        String filePath = fileStorageService.saveFile(file, "videos", VIDEO_EXTENSIONS);

        Video video = new Video();
        video.setTitle(title.trim());
        video.setDescription(description == null ? "" : description.trim());
        video.setVideoPath(filePath);
        video.setLikes(0L);
        return videoRepository.save(video);
    }

    public Video updateVideo(Long id, String title, String description, MultipartFile file) throws IOException {
        Video video = getVideoById(id);

        if (StringUtils.hasText(title)) {
            video.setTitle(title.trim());
        }
        if (description != null) {
            video.setDescription(description.trim());
        }
        if (file != null && !file.isEmpty()) {
            String oldPath = video.getVideoPath();
            String newPath = fileStorageService.saveFile(file, "videos", VIDEO_EXTENSIONS);
            video.setVideoPath(newPath);
            fileStorageService.deleteFileIfExists(oldPath);
        }

        return videoRepository.save(video);
    }

    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    public List<Video> searchVideos(String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        return videoRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(safeKeyword, safeKeyword);
    }

    @Transactional
    public Video toggleLikeVideo(Long id, String userEmail) {
        Video video = getVideoById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean alreadyLiked = video.getLikedBy().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (alreadyLiked) {
            video.getLikedBy().removeIf(u -> u.getId().equals(user.getId()));
        } else {
            video.getLikedBy().add(user);
        }
        video.setLikes((long) video.getLikedBy().size());
        return videoRepository.save(video);
    }

    public List<Long> getLikedVideoIds(String userEmail) {
        return videoRepository.findLikedIdsByUserEmail(userEmail);
    }

    public void deleteVideo(Long id) {
        Video video = getVideoById(id);
        fileStorageService.deleteFileIfExists(video.getVideoPath());
        videoRepository.delete(video);
    }

    public Video getVideoById(Long id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));
    }

    public long getTotalLikes() {
        return videoRepository.findAll().stream().mapToLong(Video::getLikes).sum();
    }

    private void validateTitle(String title) {
        if (!StringUtils.hasText(title)) {
            throw new IllegalArgumentException("Title is required");
        }
    }
}
