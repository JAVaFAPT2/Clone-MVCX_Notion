package com.clone.notion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CookieConfig implements WebMvcConfigurer {

    // Cookie configuration will be handled in controllers
    // This class provides a central place for cookie-related constants
    public static final String AUTH_COOKIE_NAME = "notion_token";
    public static final String PREFERENCE_COOKIE_NAME = "notion_preferences";
    public static final int COOKIE_MAX_AGE = 86400; // 24 hours
    public static final String COOKIE_PATH = "/";
    public static final boolean HTTP_ONLY = true;
    public static final boolean SECURE = false; // Set to true in production with HTTPS
} 