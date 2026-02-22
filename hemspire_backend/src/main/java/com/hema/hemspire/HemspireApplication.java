package com.hema.hemspire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;

import com.hema.hemspire.repository.UserRepository;
import com.hema.hemspire.entity.User;
import com.hema.hemspire.entity.Role;

@SpringBootApplication
public class HemspireApplication {

    public static void main(String[] args) {
        SpringApplication.run(HemspireApplication.class, args);
    }

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  @Value("${app.bootstrap-admin.enabled:false}") boolean enabled,
                                  @Value("${app.bootstrap-admin.name:}") String adminName,
                                  @Value("${app.bootstrap-admin.email:}") String adminEmail,
                                  @Value("${app.bootstrap-admin.password:}") String adminPassword) {
        return args -> {
            if (!enabled) {
                return;
            }

            if (!StringUtils.hasText(adminName) || !StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
                throw new IllegalStateException("Bootstrap admin enabled but name/email/password is missing");
            }

            if (userRepository.findByEmail(adminEmail).isEmpty()) {

                User admin = new User();
                admin.setName(adminName);
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ROLE_ADMIN);

                userRepository.save(admin);
            }
        };
    }
}
