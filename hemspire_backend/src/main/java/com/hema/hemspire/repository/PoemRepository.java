package com.hema.hemspire.repository;

import com.hema.hemspire.entity.Poem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PoemRepository extends JpaRepository<Poem, Long> {

    List<Poem> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String titleKeyword, String descriptionKeyword);

    @Query("select p.id from Poem p join p.likedBy u where u.email = :email")
    List<Long> findLikedIdsByUserEmail(@Param("email") String email);
}
