package com.clone.notion.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.clone.notion.model.Page;

import java.util.List;
import java.util.Optional;

public interface PageRepository extends MongoRepository<Page, String> {
    List<Page> findByUserIdOrderByParentIdAscOrderAsc(String userId);
    
    List<Page> findByUserIdAndConvexDocIdIsNotNull(String userId);
    
    Optional<Page> findByConvexDocId(String convexDocId);
    
    @Query("{'userId': ?0, '$or': [{'title': {$regex: ?1, $options: 'i'}}, {'blocks.content': {$regex: ?1, $options: 'i'}}]}")
    List<Page> searchByUserIdAndContent(String userId, String query);
    
    boolean existsByConvexDocId(String convexDocId);
    
    @Query("{'userId': ?0, 'convexDocId': {$ne: null}}")
    List<Page> findCollaborativePagesByUserId(String userId);
    
    List<Page> findByUserIdAndParentIdOrderByOrderAsc(String userId, String parentId);
} 