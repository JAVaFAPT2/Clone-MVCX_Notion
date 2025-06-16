package com.clone.notion.service;

import com.clone.notion.config.CookieConfig;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    public void setAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(CookieConfig.AUTH_COOKIE_NAME, token);
        cookie.setPath(CookieConfig.COOKIE_PATH);
        cookie.setMaxAge(CookieConfig.COOKIE_MAX_AGE);
        cookie.setHttpOnly(CookieConfig.HTTP_ONLY);
        cookie.setSecure(CookieConfig.SECURE);
        response.addCookie(cookie);
    }

    public void setPreferenceCookie(HttpServletResponse response, String preferences) {
        Cookie cookie = new Cookie(CookieConfig.PREFERENCE_COOKIE_NAME, preferences);
        cookie.setPath(CookieConfig.COOKIE_PATH);
        cookie.setMaxAge(CookieConfig.COOKIE_MAX_AGE);
        cookie.setHttpOnly(false); // Allow JavaScript access for preferences
        cookie.setSecure(CookieConfig.SECURE);
        response.addCookie(cookie);
    }

    public String getAuthCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (CookieConfig.AUTH_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public String getPreferenceCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (CookieConfig.PREFERENCE_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public void clearAuthCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(CookieConfig.AUTH_COOKIE_NAME, "");
        cookie.setPath(CookieConfig.COOKIE_PATH);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public void clearPreferenceCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(CookieConfig.PREFERENCE_COOKIE_NAME, "");
        cookie.setPath(CookieConfig.COOKIE_PATH);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
} 