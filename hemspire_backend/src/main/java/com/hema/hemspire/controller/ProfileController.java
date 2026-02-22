package com.hema.hemspire.controller;

import com.hema.hemspire.dto.UserProfileResponse;
import com.hema.hemspire.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(Authentication authentication) {
        return profileService.getCurrentProfile(authentication);
    }
}
