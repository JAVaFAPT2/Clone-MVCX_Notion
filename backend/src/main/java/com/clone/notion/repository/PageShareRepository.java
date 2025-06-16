package com.clone.notion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.clone.notion.model.PageShare;

public interface PageShareRepository extends MongoRepository<PageShare, String> {
    
    // Find all shares for a page
    List<PageShare> findByPageIdAndActiveTrue(String pageId);
    
    // Find shares by user (pages shared with user)
    List<PageShare> findBySharedWithUserIdAndActiveTrue(String userId);
    
    // Find shares by owner (pages shared by user)
    List<PageShare> findBySharedByUserIdAndActiveTrue(String userId);
    
    // Find specific share
    Optional<PageShare> findByPageIdAndSharedWithUserIdAndActiveTrue(String pageId, String userId);
    
    // Find public shares
    List<PageShare> findByPageIdAndIsPublicTrueAndActiveTrue(String pageId);
    
    // Find by share link
    Optional<PageShare> findByShareLinkAndActiveTrue(String shareLink);
    
    // Find expired shares
    @Query("{'expiresAt': {$lt: ?0}, 'active': true}")
    List<PageShare> findExpiredShares(java.time.Instant now);
    
    // Find shares with specific permission
    List<PageShare> findByPageIdAndPermissionAndActiveTrue(String pageId, String permission);
    
    // Check if user has access to page
    boolean existsByPageIdAndSharedWithUserIdAndActiveTrue(String pageId, String userId);
    
    // Delete all shares for a page
    void deleteByPageId(String pageId);
    
    // Delete all shares by a user
    void deleteBySharedByUserId(String userId);
    
    // Delete all shares with a user
    void deleteBySharedWithUserId(String userId);
} 