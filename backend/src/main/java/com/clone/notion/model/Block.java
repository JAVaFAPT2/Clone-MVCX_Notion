package com.clone.notion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Block {
    private String type; // e.g., "h1", "p", "todo"
    private String content;
} 