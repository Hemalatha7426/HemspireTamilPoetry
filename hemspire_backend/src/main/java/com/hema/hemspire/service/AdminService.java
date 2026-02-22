package com.hema.hemspire.service;

import com.hema.hemspire.dto.AdminStatsResponse;
import com.hema.hemspire.dto.UserSummaryResponse;
import com.hema.hemspire.entity.Role;
import com.hema.hemspire.entity.User;
import com.hema.hemspire.exception.BadRequestException;
import com.hema.hemspire.exception.ResourceNotFoundException;
import com.hema.hemspire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PoemRepository poemRepository;
    private final AudioRepository audioRepository;
    private final VideoRepository videoRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final PoemService poemService;
    private final AudioService audioService;
    private final VideoService videoService;

    public AdminStatsResponse getStats() {
        long totalLikes = poemService.getTotalLikes() + audioService.getTotalLikes() + videoService.getTotalLikes();
        return new AdminStatsResponse(
                userRepository.count(),
                userRepository.countByRole(Role.ROLE_ADMIN),
                poemRepository.count(),
                audioRepository.count(),
                videoRepository.count(),
                totalLikes,
                contactMessageRepository.count()
        );
    }

    public List<UserSummaryResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserSummaryResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getCreatedAt()
                ))
                .toList();
    }

    public UserSummaryResponse updateUserRole(Long userId, String roleValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role role;
        try {
            String normalizedRole = roleValue.trim().toUpperCase();
            if (!normalizedRole.startsWith("ROLE_")) {
                normalizedRole = "ROLE_" + normalizedRole;
            }
            role = Role.valueOf(normalizedRole);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Role must be ROLE_USER or ROLE_ADMIN");
        }

        user.setRole(role);
        User saved = userRepository.save(user);
        return new UserSummaryResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name(), saved.getCreatedAt());
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }
}
