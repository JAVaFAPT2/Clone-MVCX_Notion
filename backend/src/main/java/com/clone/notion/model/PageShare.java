package com.clone.notion.model;

import java.time.Instant;

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
@Document(collection = "page_shares")
public class PageShare {

    @Id
    private String id;

    private String pageId;
    private String sharedByUserId; // User who shared the page
    private String sharedWithUserId; // User with whom the page is shared
    private String permission; // "view", "edit", "comment", "admin"
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant expiresAt; // Optional expiration date
    private String shareLink; // Optional public share link
    private boolean isPublic; // Whether this is a public share
} 