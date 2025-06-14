package com.clone.notion.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clone.notion.model.Page;

public interface PageRepository extends MongoRepository<Page, String> {
} 