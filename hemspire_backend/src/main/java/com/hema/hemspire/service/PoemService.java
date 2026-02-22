package com.hema.hemspire.service;

import com.hema.hemspire.entity.Poem;
import com.hema.hemspire.entity.User;
import com.hema.hemspire.exception.ResourceNotFoundException;
import com.hema.hemspire.repository.PoemRepository;
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
public class PoemService {

    private final PoemRepository poemRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    public Poem uploadPoem(String title, String description, MultipartFile file) throws IOException {
        validateTitle(title);
        String filePath = fileStorageService.saveFile(file, "images", IMAGE_EXTENSIONS);

        Poem poem = new Poem();
        poem.setTitle(title.trim());
        poem.setDescription(description == null ? "" : description.trim());
        poem.setImagePath(filePath);
        poem.setLikes(0L);

        return poemRepository.save(poem);
    }

    public List<Poem> getAllPoems() {
        return poemRepository.findAll();
    }

    public List<Poem> searchPoems(String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        return poemRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(safeKeyword, safeKeyword);
    }

    public Poem updatePoem(Long id, String title, String description, MultipartFile file) throws IOException {
        Poem poem = getPoemById(id);

        if (StringUtils.hasText(title)) {
            poem.setTitle(title.trim());
        }
        if (description != null) {
            poem.setDescription(description.trim());
        }

        if (file != null && !file.isEmpty()) {
            String oldPath = poem.getImagePath();
            String newPath = fileStorageService.saveFile(file, "images", IMAGE_EXTENSIONS);
            poem.setImagePath(newPath);
            try {
                fileStorageService.deleteFileIfExists(oldPath);
            } catch (RuntimeException ignored) {
                // Do not fail metadata update when old file cleanup cannot be performed.
            }
        }

        return poemRepository.save(poem);
    }

    @Transactional
    public void deletePoem(Long id) {
        Poem poem = getPoemById(id);
        poem.getLikedBy().clear();
        poemRepository.save(poem);
        try {
            fileStorageService.deleteFileIfExists(poem.getImagePath());
        } catch (RuntimeException ignored) {
            // Allow DB delete even if storage cleanup fails.
        }
        poemRepository.delete(poem);
    }

    @Transactional
    public Poem toggleLikePoem(Long id, String userEmail) {
        Poem poem = getPoemById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean alreadyLiked = poem.getLikedBy().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (alreadyLiked) {
            poem.getLikedBy().removeIf(u -> u.getId().equals(user.getId()));
        } else {
            poem.getLikedBy().add(user);
        }
        poem.setLikes((long) poem.getLikedBy().size());
        return poemRepository.save(poem);
    }

    public List<Long> getLikedPoemIds(String userEmail) {
        return poemRepository.findLikedIdsByUserEmail(userEmail);
    }

    public Poem getPoemById(Long id) {
        return poemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poem not found with id: " + id));
    }

    public long getTotalLikes() {
        return poemRepository.findAll().stream().mapToLong(Poem::getLikes).sum();
    }

    private void validateTitle(String title) {
        if (!StringUtils.hasText(title)) {
            throw new IllegalArgumentException("Title is required");
        }
    }
}
