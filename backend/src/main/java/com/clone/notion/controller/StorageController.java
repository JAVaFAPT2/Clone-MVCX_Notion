package com.clone.notion.controller;

import com.clone.notion.service.LocalStorageService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StorageController {

    private final LocalStorageService localStorageService;

    public StorageController(LocalStorageService localStorageService) {
        this.localStorageService = localStorageService;
    }

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @PostMapping("/set")
    public ResponseEntity<Map<String, String>> setItem(
            @RequestBody Map<String, String> request) {
        try {
            String key = request.get("key");
            String value = request.get("value");
            String userId = getAuthenticatedUser().getId();
            
            localStorageService.setUserItem(userId, key, value);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Item stored successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/get/{key}")
    public ResponseEntity<Map<String, String>> getItem(@PathVariable String key) {
        try {
            String userId = getAuthenticatedUser().getId();
            String value = localStorageService.getUserItem(userId, key);
            
            Map<String, String> response = new HashMap<>();
            if (value != null) {
                response.put("value", value);
                response.put("exists", "true");
            } else {
                response.put("exists", "false");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/remove/{key}")
    public ResponseEntity<Map<String, String>> removeItem(@PathVariable String key) {
        try {
            String userId = getAuthenticatedUser().getId();
            localStorageService.removeUserItem(userId, key);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Item removed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearUserItems() {
        try {
            String userId = getAuthenticatedUser().getId();
            localStorageService.clearUserItems(userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "All user items cleared successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/has/{key}")
    public ResponseEntity<Map<String, Boolean>> hasItem(@PathVariable String key) {
        try {
            String userId = getAuthenticatedUser().getId();
            String value = localStorageService.getUserItem(userId, key);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", value != null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 