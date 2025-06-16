package com.clone.notion.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Page;
import com.clone.notion.service.PageService;
import com.clone.notion.service.LocalStorageService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/collaborative")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class CollaborativeController {

    private final PageService pageService;
    private final LocalStorageService localStorageService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @PostMapping("/pages/{pageId}/initialize")
    public ResponseEntity<Map<String, String>> initializeCollaborativePage(@PathVariable String pageId) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page page = pageService.findById(pageId);
            
            if (page == null || !page.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            if (page.getConvexDocId() == null) {
                String convexDocId = "doc_" + pageId + "_" + System.currentTimeMillis();
                page = pageService.updateConvexDocId(pageId, convexDocId, userId);
            }

            return ResponseEntity.ok(Map.of(
                "convexDocId", page.getConvexDocId(),
                "pageId", pageId
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/pages/{pageId}/sync-content")
    public ResponseEntity<Page> syncContentFromConvex(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> convexData) {
        try {
            String userId = getAuthenticatedUser().getId();
            
            // Create a page object from Convex data
            Page convexPage = Page.builder()
                    .title((String) convexData.get("title"))
                    .blocks((List<com.clone.notion.model.Block>) convexData.get("blocks"))
                    .build();

            Page synced = pageService.syncWithConvex(pageId, convexPage, userId);
            return synced != null ? ResponseEntity.ok(synced) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pages/{pageId}/status")
    public ResponseEntity<Map<String, Object>> getCollaborativeStatus(@PathVariable String pageId) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page page = pageService.findById(pageId);
            
            if (page == null || !page.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(Map.of(
                "pageId", pageId,
                "convexDocId", page.getConvexDocId(),
                "hasCollaborativeEditing", page.getConvexDocId() != null,
                "lastUpdated", page.getUpdatedAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/pages/{pageId}/disconnect")
    public ResponseEntity<Page> disconnectFromConvex(@PathVariable String pageId) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page updated = pageService.updateConvexDocId(pageId, null, userId);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pages/search")
    public ResponseEntity<List<Page>> searchCollaborativePages(@RequestParam String query) {
        try {
            String userId = getAuthenticatedUser().getId();
            List<Page> results = pageService.searchPages(query, userId);
            
            // Filter to only return pages with collaborative editing enabled
            List<Page> collaborativePages = results.stream()
                    .filter(page -> page.getConvexDocId() != null)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(collaborativePages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/pages/{pageId}/merge")
    public ResponseEntity<Page> mergeConvexChanges(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> mergeData) {
        try {
            String userId = getAuthenticatedUser().getId();
            
            // Extract merge data
            String title = (String) mergeData.get("title");
            List<com.clone.notion.model.Block> blocks = (List<com.clone.notion.model.Block>) mergeData.get("blocks");
            String conflictResolution = (String) mergeData.get("resolution"); // "convex" or "local"
            
            Page page = pageService.findById(pageId);
            if (page == null || !page.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            // Apply merge based on conflict resolution strategy
            if ("convex".equals(conflictResolution)) {
                page.setTitle(title);
                page.setBlocks(blocks);
            }
            // If "local", keep existing content
            
            page.setUpdatedAt(Instant.now());
            Page merged = pageService.update(pageId, page, userId);
            
            return merged != null ? ResponseEntity.ok(merged) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // New collaborative features

    @PostMapping("/pages/{pageId}/presence")
    public ResponseEntity<Map<String, Object>> updatePresence(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> presenceData) {
        try {
            String userId = getAuthenticatedUser().getId();
            String username = getAuthenticatedUser().getUsername();
            
            // Store presence information in localStorage
            String presenceKey = "presence:" + pageId + ":" + userId;
            Map<String, Object> presence = Map.of(
                "userId", userId,
                "username", username,
                "timestamp", Instant.now().toString(),
                "cursor", presenceData.get("cursor"),
                "selection", presenceData.get("selection")
            );
            
            localStorageService.setUserItem(userId, presenceKey, presence.toString());
            
            return ResponseEntity.ok(Map.of(
                "message", "Presence updated",
                "userId", userId,
                "username", username
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pages/{pageId}/presence")
    public ResponseEntity<List<Map<String, Object>>> getPresence(@PathVariable String pageId) {
        try {
            String userId = getAuthenticatedUser().getId();
            
            // Get all presence data for this page
            // This is a simplified implementation - in production, you'd use a more sophisticated approach
            List<Map<String, Object>> presenceList = List.of();
            
            return ResponseEntity.ok(presenceList);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/pages/{pageId}/comments")
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> commentData) {
        try {
            String userId = getAuthenticatedUser().getId();
            String username = getAuthenticatedUser().getUsername();
            
            // Store comment in localStorage (in production, use a proper database)
            String commentKey = "comment:" + pageId + ":" + System.currentTimeMillis();
            Map<String, Object> comment = Map.of(
                "id", System.currentTimeMillis(),
                "userId", userId,
                "username", username,
                "content", commentData.get("content"),
                "timestamp", Instant.now().toString(),
                "blockId", commentData.get("blockId")
            );
            
            localStorageService.setUserItem(userId, commentKey, comment.toString());
            
            return ResponseEntity.ok(Map.of(
                "message", "Comment added",
                "comment", comment
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pages/{pageId}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable String pageId) {
        try {
            String userId = getAuthenticatedUser().getId();
            
            // Get comments for this page
            // This is a simplified implementation
            List<Map<String, Object>> comments = List.of();
            
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/pages/{pageId}/share")
    public ResponseEntity<Map<String, Object>> sharePage(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> shareData) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page page = pageService.findById(pageId);
            
            if (page == null || !page.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            // Store sharing information
            String shareKey = "share:" + pageId;
            Map<String, Object> shareInfo = Map.of(
                "pageId", pageId,
                "sharedBy", userId,
                "sharedWith", shareData.get("sharedWith"),
                "permissions", shareData.get("permissions"),
                "timestamp", Instant.now().toString()
            );
            
            localStorageService.setUserItem(userId, shareKey, shareInfo.toString());
            
            return ResponseEntity.ok(Map.of(
                "message", "Page shared successfully",
                "shareInfo", shareInfo
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pages/{pageId}/version-history")
    public ResponseEntity<List<Map<String, Object>>> getVersionHistory(@PathVariable String pageId) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page page = pageService.findById(pageId);
            
            if (page == null || !page.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            // Get version history (simplified implementation)
            List<Map<String, Object>> versions = List.of(
                Map.of(
                    "version", 1,
                    "timestamp", page.getCreatedAt().toString(),
                    "action", "created"
                ),
                Map.of(
                    "version", 2,
                    "timestamp", page.getUpdatedAt().toString(),
                    "action", "updated"
                )
            );
            
            return ResponseEntity.ok(versions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

