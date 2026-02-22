package com.hema.hemspire.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalAdmins;
    private long totalPoems;
    private long totalAudios;
    private long totalVideos;
    private long totalLikes;
    private long totalContactMessages;
}
