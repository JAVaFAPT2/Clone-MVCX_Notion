package com.clone.notion.model;

public enum BlockType {
    PARAGRAPH("paragraph"),
    HEADING("heading"),
    HEADING1("heading1"),
    HEADING2("heading2"),
    TODO("todo"),
    BULLETED("bulleted"),
    BULLETED_LIST("bulleted_list"),
    NUMBERED("numbered"),
    QUOTE("quote"),
    CODE("code"),
    CALLOUT("callout");

    private final String value;

    BlockType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static BlockType fromString(String text) {
        for (BlockType type : BlockType.values()) {
            if (type.value.equalsIgnoreCase(text)) {
                return type;
            }
        }
        throw new IllegalArgumentException("No constant with text " + text + " found");
    }
} 