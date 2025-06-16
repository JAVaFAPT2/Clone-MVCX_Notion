package com.clone.notion.model;

import java.time.Instant;
import java.util.List;
import java.util.Set;

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
@Document(collection = "pages")
public class Page {

    @Id
    private String id;

    private String userId; // To associate page with a user

    private String parentId; // For hierarchical pages

    private Integer order; // For sibling ordering within the same parent

    private String icon; // e.g., an emoji or icon URL

    private String title;

    private List<Block> blocks;

    private String convexDocId; // ID for the document in Convex for collaborative editing

    // Page linking fields
    private Set<String> linkedPageIds; // Pages that this page links to
    private Set<String> backlinkPageIds; // Pages that link to this page

    private Instant createdAt;

    private Instant updatedAt;
} 