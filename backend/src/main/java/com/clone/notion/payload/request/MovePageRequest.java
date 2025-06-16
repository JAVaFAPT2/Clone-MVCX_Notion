package com.clone.notion.payload.request;

import lombok.Data;

@Data
public class MovePageRequest {
    private String newParentId;
    private Integer newOrder;
} 