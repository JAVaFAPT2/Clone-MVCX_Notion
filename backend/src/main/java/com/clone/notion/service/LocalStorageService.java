package com.clone.notion.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class LocalStorageService {
    
    private final Map<String, StorageItem> storage = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newScheduledThreadPool(1);
    
    public LocalStorageService() {
        // Clean up expired items every 5 minutes
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredItems, 5, 5, TimeUnit.MINUTES);
    }
    
    public void setItem(String key, String value) {
        setItem(key, value, 3600); // Default 1 hour expiry
    }
    
    public void setItem(String key, String value, int expirySeconds) {
        long expiryTime = System.currentTimeMillis() + (expirySeconds * 1000L);
        storage.put(key, new StorageItem(value, expiryTime));
    }
    
    public String getItem(String key) {
        StorageItem item = storage.get(key);
        if (item != null && !item.isExpired()) {
            return item.getValue();
        }
        if (item != null && item.isExpired()) {
            storage.remove(key);
        }
        return null;
    }
    
    public void removeItem(String key) {
        storage.remove(key);
    }
    
    public void clear() {
        storage.clear();
    }
    
    public boolean hasItem(String key) {
        StorageItem item = storage.get(key);
        if (item != null && item.isExpired()) {
            storage.remove(key);
            return false;
        }
        return item != null;
    }
    
    private void cleanupExpiredItems() {
        storage.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
    
    // User-specific storage methods
    public void setUserItem(String userId, String key, String value) {
        setItem(userId + ":" + key, value);
    }
    
    public String getUserItem(String userId, String key) {
        return getItem(userId + ":" + key);
    }
    
    public void removeUserItem(String userId, String key) {
        removeItem(userId + ":" + key);
    }
    
    public void clearUserItems(String userId) {
        storage.entrySet().removeIf(entry -> entry.getKey().startsWith(userId + ":"));
    }
    
    private static class StorageItem {
        private final String value;
        private final long expiryTime;
        
        public StorageItem(String value, long expiryTime) {
            this.value = value;
            this.expiryTime = expiryTime;
        }
        
        public String getValue() {
            return value;
        }
        
        public boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }
} 