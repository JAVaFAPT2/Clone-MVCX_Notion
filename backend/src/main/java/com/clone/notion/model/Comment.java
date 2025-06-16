package com.clone.notion.model;

import java.time.Instant;
import java.util.List;

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
@Document(collection = "comments")
public class Comment {

    @Id
    private String id;

    private String pageId;
    private String userId;
    private String username;
    private String content;
    private String blockId; // Optional: for block-specific comments
    private String parentCommentId; // For replies
    private List<String> mentions; // List of mentioned user IDs
    private boolean resolved;
    private Instant createdAt;
    private Instant updatedAt;
    private List<Comment> replies; // Nested replies
} 