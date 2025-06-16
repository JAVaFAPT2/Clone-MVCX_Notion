package com.clone.notion.model;

public enum Permission {
    VIEW("view", "Can view the page"),
    COMMENT("comment", "Can view and add comments"),
    EDIT("edit", "Can view, comment, and edit the page"),
    ADMIN("admin", "Full access including sharing and deletion");

    private final String value;
    private final String description;

    Permission(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static Permission fromValue(String value) {
        for (Permission permission : Permission.values()) {
            if (permission.value.equals(value)) {
                return permission;
            }
        }
        throw new IllegalArgumentException("Unknown permission: " + value);
    }

    public boolean canView() {
        return true; // All permissions include view
    }

    public boolean canComment() {
        return this == COMMENT || this == EDIT || this == ADMIN;
    }

    public boolean canEdit() {
        return this == EDIT || this == ADMIN;
    }

    public boolean canShare() {
        return this == ADMIN;
    }

    public boolean canDelete() {
        return this == ADMIN;
    }
} 