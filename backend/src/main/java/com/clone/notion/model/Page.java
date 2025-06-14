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
@Document(collection = "pages")
public class Page {

    @Id
    private String id;

    private String title;

    private List<String> blocks; // Simplified: list of rich-text blocks in markdown/HTML

    private Instant createdAt;

    private Instant updatedAt;
} 