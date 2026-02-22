package com.hema.hemspire.controller;

import com.hema.hemspire.dto.AdminStatsResponse;
import com.hema.hemspire.dto.UpdateUserRoleRequest;
import com.hema.hemspire.dto.UserSummaryResponse;
import com.hema.hemspire.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public List<UserSummaryResponse> getUsers() {
        return adminService.getUsers();
    }

    @PutMapping("/users/{id}/role")
    public UserSummaryResponse updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        return adminService.updateUserRole(id, request.getRole());
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }
}
