package com.clone.notion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.clone.notion.model.Template;

public interface TemplateRepository extends MongoRepository<Template, String> {
    
    // Find all public templates
    List<Template> findByIsPublicTrueAndIsArchivedFalseOrderByUsageCountDesc();
    
    // Find templates by category
    List<Template> findByCategoryAndIsPublicTrueAndIsArchivedFalseOrderByUsageCountDesc(String category);
    
    // Find templates by creator
    List<Template> findByCreatedByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(String userId);
    
    // Find official templates
    List<Template> findByIsOfficialTrueAndIsArchivedFalseOrderByUsageCountDesc();
    
    // Find templates by tags
    @Query("{'tags': {$in: ?0}, 'isPublic': true, 'isArchived': false}")
    List<Template> findByTagsInAndIsPublicTrueAndIsArchivedFalseOrderByUsageCountDesc(List<String> tags);
    
    // Search templates by name or description
    @Query("{'$or': [{'name': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}}], 'isPublic': true, 'isArchived': false}")
    List<Template> searchTemplates(String searchTerm);
    
    // Find templates shared with user
    @Query("{'sharedWithUsers': ?0, 'isArchived': false}")
    List<Template> findBySharedWithUsersContainingAndIsArchivedFalse(String userId);
    
    // Find most popular templates
    List<Template> findByIsPublicTrueAndIsArchivedFalseOrderByUsageCountDescRatingDesc();
    
    // Find recently used templates
    List<Template> findByIsPublicTrueAndIsArchivedFalseOrderByLastUsedAtDesc();
    
    // Find templates by rating
    @Query("{'rating': {$gte: ?0}, 'isPublic': true, 'isArchived': false}")
    List<Template> findByRatingGreaterThanEqualAndIsPublicTrueAndIsArchivedFalse(double minRating);
    
    // Count templates by category
    long countByCategoryAndIsPublicTrueAndIsArchivedFalse(String category);
    
    // Count templates by creator
    long countByCreatedByUserIdAndIsArchivedFalse(String userId);
    
    // Find templates with high usage
    @Query("{'usageCount': {$gte: ?0}, 'isPublic': true, 'isArchived': false}")
    List<Template> findByUsageCountGreaterThanEqualAndIsPublicTrueAndIsArchivedFalse(int minUsage);
    
    // Find templates by permission level
    List<Template> findByPermissionAndIsArchivedFalse(String permission);
    
    // Find archived templates
    List<Template> findByIsArchivedTrueOrderByUpdatedAtDesc();
    
    // Find templates by multiple categories
    @Query("{'category': {$in: ?0}, 'isPublic': true, 'isArchived': false}")
    List<Template> findByCategoryInAndIsPublicTrueAndIsArchivedFalse(List<String> categories);
    
    // Count methods for statistics
    long countByIsPublicTrueAndIsArchivedFalse();
    long countByIsOfficialTrueAndIsArchivedFalse();
    long countByIsOfficialFalseAndIsArchivedFalse();
} 