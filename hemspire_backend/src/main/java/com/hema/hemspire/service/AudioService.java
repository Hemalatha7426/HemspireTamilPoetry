package com.hema.hemspire.service;

import com.hema.hemspire.entity.Audio;
import com.hema.hemspire.entity.User;
import com.hema.hemspire.exception.ResourceNotFoundException;
import com.hema.hemspire.repository.AudioRepository;
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
public class AudioService {

    private final AudioRepository audioRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private static final Set<String> AUDIO_EXTENSIONS = Set.of("mp3", "wav", "aac", "m4a", "ogg");

    public Audio uploadAudio(String title, String description, MultipartFile file) throws IOException {
        validateTitle(title);
        String filePath = fileStorageService.saveFile(file, "audios", AUDIO_EXTENSIONS);

        Audio audio = new Audio();
        audio.setTitle(title.trim());
        audio.setDescription(description == null ? "" : description.trim());
        audio.setAudioPath(filePath);
        audio.setLikes(0L);
        return audioRepository.save(audio);
    }

    public Audio updateAudio(Long id, String title, String description, MultipartFile file) throws IOException {
        Audio audio = getAudioById(id);

        if (StringUtils.hasText(title)) {
            audio.setTitle(title.trim());
        }
        if (description != null) {
            audio.setDescription(description.trim());
        }
        if (file != null && !file.isEmpty()) {
            String oldPath = audio.getAudioPath();
            String newPath = fileStorageService.saveFile(file, "audios", AUDIO_EXTENSIONS);
            audio.setAudioPath(newPath);
            fileStorageService.deleteFileIfExists(oldPath);
        }

        return audioRepository.save(audio);
    }

    public List<Audio> getAllAudios() {
        return audioRepository.findAll();
    }

    public List<Audio> searchAudios(String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        return audioRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(safeKeyword, safeKeyword);
    }

    @Transactional
    public Audio toggleLikeAudio(Long id, String userEmail) {
        Audio audio = getAudioById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean alreadyLiked = audio.getLikedBy().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (alreadyLiked) {
            audio.getLikedBy().removeIf(u -> u.getId().equals(user.getId()));
        } else {
            audio.getLikedBy().add(user);
        }
        audio.setLikes((long) audio.getLikedBy().size());
        return audioRepository.save(audio);
    }

    public List<Long> getLikedAudioIds(String userEmail) {
        return audioRepository.findLikedIdsByUserEmail(userEmail);
    }

    public void deleteAudio(Long id) {
        Audio audio = getAudioById(id);
        fileStorageService.deleteFileIfExists(audio.getAudioPath());
        audioRepository.delete(audio);
    }

    public Audio getAudioById(Long id) {
        return audioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audio not found with id: " + id));
    }

    public long getTotalLikes() {
        return audioRepository.findAll().stream().mapToLong(Audio::getLikes).sum();
    }

    private void validateTitle(String title) {
        if (!StringUtils.hasText(title)) {
            throw new IllegalArgumentException("Title is required");
        }
    }
}
