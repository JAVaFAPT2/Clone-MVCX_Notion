package com.clone.notion.repository;

import com.clone.notion.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    
    @Query("{'$or': [{'username': ?0}, {'email': ?0}]}")
    Optional<User> findByUsernameOrEmail(String usernameOrEmail);
} 