package com.hema.hemspire.repository;

import com.hema.hemspire.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String titleKeyword, String descriptionKeyword);

    @Query("select v.id from Video v join v.likedBy u where u.email = :email")
    List<Long> findLikedIdsByUserEmail(@Param("email") String email);
}
