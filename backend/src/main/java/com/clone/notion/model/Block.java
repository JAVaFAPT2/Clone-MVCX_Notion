package com.clone.notion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Block {
    private String id;
    private BlockType type;
    private String content;
    private Boolean checked; // For todo blocks, null otherwise
    
    public BlockType getType() {
        return type != null ? type : BlockType.PARAGRAPH; // Default to paragraph if null
    }
    
    public void setType(BlockType type) {
        this.type = type;
    }
    
    public void setType(String typeString) {
        if (typeString == null) {
            this.type = BlockType.PARAGRAPH;
            return;
        }
        
        try {
            this.type = BlockType.fromString(typeString);
        } catch (IllegalArgumentException e) {
            System.out.println("[WARN] Invalid block type: " + typeString + ", defaulting to PARAGRAPH");
            this.type = BlockType.PARAGRAPH;
        }
    }
} 