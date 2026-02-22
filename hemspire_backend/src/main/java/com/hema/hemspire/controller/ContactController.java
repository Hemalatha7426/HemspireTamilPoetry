package com.hema.hemspire.controller;

import com.hema.hemspire.dto.ApiMessageResponse;
import com.hema.hemspire.dto.ContactRequest;
import com.hema.hemspire.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ApiMessageResponse submitContact(@Valid @RequestBody ContactRequest request) {
        contactService.submit(request);
        return new ApiMessageResponse("Contact form submitted successfully");
    }
}
