package com.clone.notion.payload.request;

import java.util.List;

import com.clone.notion.model.Block;

import lombok.Data;

@Data
public class CollaborativeEditRequest {
    private String title;
    private List<Block> blocks;
    private String convexDocId;
    private String operation; // "create", "update", "delete", "sync"
    private Long timestamp;
    private String userId;
} 