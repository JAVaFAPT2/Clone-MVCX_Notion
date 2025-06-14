package com.clone.notion.repository;

import com.clone.notion.model.ERole;
import com.clone.notion.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(ERole name);
} 