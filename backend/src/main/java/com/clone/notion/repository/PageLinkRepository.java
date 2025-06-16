package com.clone.notion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.clone.notion.model.PageLink;

public interface PageLinkRepository extends MongoRepository<PageLink, String> {
    
    // Find all links from a specific page
    List<PageLink> findBySourcePageId(String sourcePageId);
    
    // Find all links to a specific page
    List<PageLink> findByTargetPageId(String targetPageId);
    
    // Find links by source page and block
    List<PageLink> findBySourcePageIdAndBlockId(String sourcePageId, String blockId);
    
    // Find specific link
    Optional<PageLink> findBySourcePageIdAndTargetPageIdAndBlockId(String sourcePageId, String targetPageId, String blockId);
    
    // Delete all links from a page
    void deleteBySourcePageId(String sourcePageId);
    
    // Delete all links to a page
    void deleteByTargetPageId(String targetPageId);
    
    // Find links by user (pages owned by user)
    @Query("{'$or': [{'sourcePageId': {'$in': ?0}}, {'targetPageId': {'$in': ?0}}]}")
    List<PageLink> findByPageIds(List<String> pageIds);
} 