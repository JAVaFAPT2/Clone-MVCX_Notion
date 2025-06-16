package com.clone.notion.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "templates")
public class Template {

    @Id
    private String id;

    private String name;
    private String description;
    private String category; // "page", "database", "workflow", "meeting", etc.
    private String createdByUserId;
    private String createdByUsername;
    private boolean isPublic; // Whether template is available to all users
    private boolean isOfficial; // Whether it's an official template
    private String icon; // Emoji or icon representation
    private String color; // Template color theme
    
    // Template content
    private Map<String, Object> content; // The actual template structure
    private List<String> tags; // Searchable tags
    private List<String> blocks; // Block IDs that make up the template
    
    // Metadata
    private int usageCount; // How many times this template has been used
    private double rating; // Average rating (1-5)
    private int ratingCount; // Number of ratings
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastUsedAt;
    
    // Sharing and permissions
    private List<String> sharedWithUsers; // Users who can use this template
    private String permission; // "view", "edit", "admin"
    private boolean isArchived; // Whether template is archived
    
    // Explicit setter for isArchived to fix Lombok issue
    public void setIsArchived(boolean isArchived) {
        this.isArchived = isArchived;
    }
} 