package com.hema.hemspire.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hema.hemspire.entity.Role;
import com.hema.hemspire.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    long countByRole(Role role);
}
