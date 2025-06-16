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
@Document(collection = "page_links")
public class PageLink {

    @Id
    private String id;

    private String sourcePageId; // Page that contains the link
    private String targetPageId; // Page that is linked to
    private String linkText; // Optional text for the link
    private String blockId; // ID of the block containing the link
    private Integer position; // Position within the block

    private Instant createdAt;
    private Instant updatedAt;
} 