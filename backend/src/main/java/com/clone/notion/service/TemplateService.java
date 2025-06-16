package com.clone.notion.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.clone.notion.model.Template;
import com.clone.notion.repository.TemplateRepository;
import com.clone.notion.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final UserRepository userRepository;

    public Template createTemplate(String name, String description, String category, 
                                 String createdByUserId, String createdByUsername, 
                                 Map<String, Object> content, List<String> tags, 
                                 List<String> blocks, boolean isPublic) {
        
        Template template = Template.builder()
            .name(name)
            .description(description)
            .category(category)
            .createdByUserId(createdByUserId)
            .createdByUsername(createdByUsername)
            .isPublic(isPublic)
            .isOfficial(false) // User-created templates are not official by default
            .icon("📄") // Default icon
            .color("#007bff") // Default color
            .content(content)
            .tags(tags != null ? tags : new ArrayList<>())
            .blocks(blocks != null ? blocks : new ArrayList<>())
            .usageCount(0)
            .rating(0.0)
            .ratingCount(0)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .sharedWithUsers(new ArrayList<>())
            .permission("admin") // Creator has admin permission
            .isArchived(false)
            .build();
        
        return templateRepository.save(template);
    }

    public Template createOfficialTemplate(String name, String description, String category,
                                         Map<String, Object> content, List<String> tags,
                                         List<String> blocks, String icon, String color) {
        
        Template template = Template.builder()
            .name(name)
            .description(description)
            .category(category)
            .createdByUserId("system") // Official templates are created by system
            .createdByUsername("Notion Team")
            .isPublic(true) // Official templates are always public
            .isOfficial(true)
            .icon(icon != null ? icon : "📄")
            .color(color != null ? color : "#007bff")
            .content(content)
            .tags(tags != null ? tags : new ArrayList<>())
            .blocks(blocks != null ? blocks : new ArrayList<>())
            .usageCount(0)
            .rating(0.0)
            .ratingCount(0)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .sharedWithUsers(new ArrayList<>())
            .permission("view") // Official templates are view-only
            .isArchived(false)
            .build();
        
        return templateRepository.save(template);
    }

    public List<Template> getAllPublicTemplates() {
        return templateRepository.findByIsPublicTrueAndIsArchivedFalseOrderByUsageCountDesc();
    }

    public List<Template> getTemplatesByCategory(String category) {
        return templateRepository.findByCategoryAndIsPublicTrueAndIsArchivedFalseOrderByUsageCountDesc(category);
    }

    public List<Template> getTemplatesByCreator(String userId) {
        return templateRepository.findByCreatedByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(userId);
    }

    public List<Template> getOfficialTemplates() {
        return templateRepository.findByIsOfficialTrueAndIsArchivedFalseOrderByUsageCountDesc();
    }

    public List<Template> searchTemplates(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllPublicTemplates();
        }
        return templateRepository.searchTemplates(searchTerm.trim());
    }

    public List<Template> getTemplatesByTags(List<String> tags) {
        return templateRepository.findByTagsInAndIsPublicTrueAndIsArchivedFalseOrderByUsageCountDesc(tags);
    }

    public List<Template> getTemplatesSharedWithUser(String userId) {
        return templateRepository.findBySharedWithUsersContainingAndIsArchivedFalse(userId);
    }

    public List<Template> getMostPopularTemplates() {
        return templateRepository.findByIsPublicTrueAndIsArchivedFalseOrderByUsageCountDescRatingDesc();
    }

    public List<Template> getRecentlyUsedTemplates() {
        return templateRepository.findByIsPublicTrueAndIsArchivedFalseOrderByLastUsedAtDesc();
    }

    public List<Template> getTemplatesByRating(double minRating) {
        return templateRepository.findByRatingGreaterThanEqualAndIsPublicTrueAndIsArchivedFalse(minRating);
    }

    public List<Template> getTemplatesByUsage(int minUsage) {
        return templateRepository.findByUsageCountGreaterThanEqualAndIsPublicTrueAndIsArchivedFalse(minUsage);
    }

    public Optional<Template> getTemplateById(String templateId) {
        return templateRepository.findById(templateId);
    }

    public Template updateTemplate(String templateId, String name, String description, 
                                 String category, Map<String, Object> content, 
                                 List<String> tags, List<String> blocks, 
                                 String icon, String color, String updatedByUserId) {
        
        Optional<Template> existingTemplate = templateRepository.findById(templateId);
        if (existingTemplate.isEmpty()) {
            throw new IllegalArgumentException("Template not found");
        }
        
        Template template = existingTemplate.get();
        
        // Check if user can update the template
        if (!template.getCreatedByUserId().equals(updatedByUserId) && 
            !template.getPermission().equals("admin")) {
            throw new IllegalArgumentException("Not authorized to update this template");
        }
        
        template.setName(name != null ? name : template.getName());
        template.setDescription(description != null ? description : template.getDescription());
        template.setCategory(category != null ? category : template.getCategory());
        template.setContent(content != null ? content : template.getContent());
        template.setTags(tags != null ? tags : template.getTags());
        template.setBlocks(blocks != null ? blocks : template.getBlocks());
        template.setIcon(icon != null ? icon : template.getIcon());
        template.setColor(color != null ? color : template.getColor());
        template.setUpdatedAt(Instant.now());
        
        return templateRepository.save(template);
    }

    public void deleteTemplate(String templateId, String deletedByUserId) {
        Optional<Template> template = templateRepository.findById(templateId);
        if (template.isEmpty()) {
            throw new IllegalArgumentException("Template not found");
        }
        
        Template templateToDelete = template.get();
        
        // Check if user can delete the template
        if (!templateToDelete.getCreatedByUserId().equals(deletedByUserId) && 
            !templateToDelete.getPermission().equals("admin")) {
            throw new IllegalArgumentException("Not authorized to delete this template");
        }
        
        // Archive instead of delete
        templateToDelete.setIsArchived(true);
        templateToDelete.setUpdatedAt(Instant.now());
        templateRepository.save(templateToDelete);
    }

    public Template useTemplate(String templateId, String usedByUserId) {
        Optional<Template> template = templateRepository.findById(templateId);
        if (template.isEmpty()) {
            throw new IllegalArgumentException("Template not found");
        }
        
        Template templateToUse = template.get();
        
        // Check if user can use the template
        if (!templateToUse.isPublic() && 
            !templateToUse.getCreatedByUserId().equals(usedByUserId) &&
            !templateToUse.getSharedWithUsers().contains(usedByUserId)) {
            throw new IllegalArgumentException("Not authorized to use this template");
        }
        
        // Update usage statistics
        templateToUse.setUsageCount(templateToUse.getUsageCount() + 1);
        templateToUse.setLastUsedAt(Instant.now());
        
        return templateRepository.save(templateToUse);
    }

    public Template rateTemplate(String templateId, double rating, String ratedByUserId) {
        if (rating < 1.0 || rating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 1.0 and 5.0");
        }
        
        Optional<Template> template = templateRepository.findById(templateId);
        if (template.isEmpty()) {
            throw new IllegalArgumentException("Template not found");
        }
        
        Template templateToRate = template.get();
        
        // Check if user can rate the template
        if (!templateToRate.isPublic() && 
            !templateToRate.getCreatedByUserId().equals(ratedByUserId) &&
            !templateToRate.getSharedWithUsers().contains(ratedByUserId)) {
            throw new IllegalArgumentException("Not authorized to rate this template");
        }
        
        // Update rating
        double currentRating = templateToRate.getRating();
        int currentCount = templateToRate.getRatingCount();
        
        double newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
        
        templateToRate.setRating(newRating);
        templateToRate.setRatingCount(currentCount + 1);
        templateToRate.setUpdatedAt(Instant.now());
        
        return templateRepository.save(templateToRate);
    }

    public Template shareTemplate(String templateId, String sharedWithUserId, String sharedByUserId) {
        Optional<Template> template = templateRepository.findById(templateId);
        if (template.isEmpty()) {
            throw new IllegalArgumentException("Template not found");
        }
        
        Template templateToShare = template.get();
        
        // Check if user can share the template
        if (!templateToShare.getCreatedByUserId().equals(sharedByUserId) && 
            !templateToShare.getPermission().equals("admin")) {
            throw new IllegalArgumentException("Not authorized to share this template");
        }
        
        // Check if user exists
        if (!userRepository.existsById(sharedWithUserId)) {
            throw new IllegalArgumentException("User not found");
        }
        
        // Add user to shared list if not already there
        if (!templateToShare.getSharedWithUsers().contains(sharedWithUserId)) {
            templateToShare.getSharedWithUsers().add(sharedWithUserId);
            templateToShare.setUpdatedAt(Instant.now());
            return templateRepository.save(templateToShare);
        }
        
        return templateToShare;
    }

    public Template unshareTemplate(String templateId, String unsharedWithUserId, String unsharedByUserId) {
        Optional<Template> template = templateRepository.findById(templateId);
        if (template.isEmpty()) {
            throw new IllegalArgumentException("Template not found");
        }
        
        Template templateToUnshare = template.get();
        
        // Check if user can unshare the template
        if (!templateToUnshare.getCreatedByUserId().equals(unsharedByUserId) && 
            !templateToUnshare.getPermission().equals("admin")) {
            throw new IllegalArgumentException("Not authorized to unshare this template");
        }
        
        // Remove user from shared list
        templateToUnshare.getSharedWithUsers().remove(unsharedWithUserId);
        templateToUnshare.setUpdatedAt(Instant.now());
        
        return templateRepository.save(templateToUnshare);
    }

    public List<String> getAvailableCategories() {
        // This could be made configurable or fetched from database
        return List.of(
            "page", "database", "workflow", "meeting", "project", 
            "documentation", "planning", "tracking", "brainstorming", "other"
        );
    }

    public Map<String, Long> getTemplateStats() {
        Map<String, Long> stats = Map.of(
            "total", templateRepository.countByIsPublicTrueAndIsArchivedFalse(),
            "official", templateRepository.countByIsOfficialTrueAndIsArchivedFalse(),
            "userCreated", templateRepository.countByIsOfficialFalseAndIsArchivedFalse()
        );
        return stats;
    }

    public void initializeDefaultTemplates() {
        // Create some default official templates
        if (templateRepository.countByIsOfficialTrueAndIsArchivedFalse() == 0) {
            createDefaultTemplates();
        }
    }

    private void createDefaultTemplates() {
        // Meeting Notes Template
        createOfficialTemplate(
            "Meeting Notes",
            "A comprehensive template for taking meeting notes with action items and follow-ups",
            "meeting",
            Map.of(
                "title", "Meeting Notes",
                "sections", List.of(
                    Map.of("type", "heading", "text", "Agenda"),
                    Map.of("type", "heading", "text", "Discussion Points"),
                    Map.of("type", "heading", "text", "Action Items"),
                    Map.of("type", "heading", "text", "Next Steps")
                )
            ),
            List.of("meeting", "notes", "agenda", "action-items"),
            new ArrayList<>(),
            "📝",
            "#28a745"
        );

        // Project Plan Template
        createOfficialTemplate(
            "Project Plan",
            "A structured template for project planning with milestones and timelines",
            "project",
            Map.of(
                "title", "Project Plan",
                "sections", List.of(
                    Map.of("type", "heading", "text", "Project Overview"),
                    Map.of("type", "heading", "text", "Objectives"),
                    Map.of("type", "heading", "text", "Timeline"),
                    Map.of("type", "heading", "text", "Resources"),
                    Map.of("type", "heading", "text", "Risks & Mitigation")
                )
            ),
            List.of("project", "planning", "timeline", "objectives"),
            new ArrayList<>(),
            "📋",
            "#007bff"
        );

        // Daily Journal Template
        createOfficialTemplate(
            "Daily Journal",
            "A personal template for daily reflection and journaling",
            "page",
            Map.of(
                "title", "Daily Journal",
                "sections", List.of(
                    Map.of("type", "heading", "text", "Today's Highlights"),
                    Map.of("type", "heading", "text", "Gratitude"),
                    Map.of("type", "heading", "text", "Challenges"),
                    Map.of("type", "heading", "text", "Tomorrow's Goals")
                )
            ),
            List.of("journal", "daily", "reflection", "personal"),
            new ArrayList<>(),
            "📔",
            "#ffc107"
        );
    }
} 