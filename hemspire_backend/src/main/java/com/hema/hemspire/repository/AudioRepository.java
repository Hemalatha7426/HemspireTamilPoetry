package com.hema.hemspire.repository;

import com.hema.hemspire.entity.Audio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AudioRepository extends JpaRepository<Audio, Long> {

    List<Audio> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String titleKeyword, String descriptionKeyword);

    @Query("select a.id from Audio a join a.likedBy u where u.email = :email")
    List<Long> findLikedIdsByUserEmail(@Param("email") String email);
}
