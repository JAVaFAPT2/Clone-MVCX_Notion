package com.clone.notion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.clone.notion.model.Comment;

public interface CommentRepository extends MongoRepository<Comment, String> {
    
    // Find all comments for a page
    List<Comment> findByPageIdOrderByCreatedAtDesc(String pageId);
    
    // Find comments for a specific block
    List<Comment> findByPageIdAndBlockIdOrderByCreatedAtDesc(String pageId, String blockId);
    
    // Find top-level comments (no parent)
    List<Comment> findByPageIdAndParentCommentIdIsNullOrderByCreatedAtDesc(String pageId);
    
    // Find replies for a specific comment
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);
    
    // Find comments by user
    List<Comment> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find comments that mention a specific user
    @Query("{'mentions': ?0}")
    List<Comment> findByMentionsContaining(String userId);
    
    // Find unresolved comments for a page
    List<Comment> findByPageIdAndResolvedFalseOrderByCreatedAtDesc(String pageId);
    
    // Count comments for a page
    long countByPageId(String pageId);
    
    // Delete all comments for a page
    void deleteByPageId(String pageId);
    
    // Delete all comments for a block
    void deleteByPageIdAndBlockId(String pageId, String blockId);
    
    // Delete all replies for a parent comment
    void deleteByParentCommentId(String parentCommentId);
} 