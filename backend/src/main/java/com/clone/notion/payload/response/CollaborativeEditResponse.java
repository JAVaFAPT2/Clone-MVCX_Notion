package com.clone.notion.payload.response;

import java.util.List;

import lombok.Data;

@Data
public class CollaborativeEditResponse {
    private String pageId;
    private String convexDocId;
    private boolean success;
    private String message;
    private List<String> collaborators;
    private Long lastSyncTimestamp;
    private boolean hasConflicts;
} 