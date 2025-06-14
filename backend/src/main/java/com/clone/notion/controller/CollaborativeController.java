package com.clone.notion.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Page;
import com.clone.notion.service.PageService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/collaborative")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class CollaborativeController {

    private final PageService pageService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @PostMapping("/pages/{pageId}/initialize")
    public ResponseEntity<Map<String, String>> initializeCollaborativePage(@PathVariable String pageId) {
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
    }

    @PostMapping("/pages/{pageId}/sync-content")
    public ResponseEntity<Page> syncContentFromConvex(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> convexData) {
        
        String userId = getAuthenticatedUser().getId();
        
        // Create a page object from Convex data
        Page convexPage = Page.builder()
                .title((String) convexData.get("title"))
                .blocks((List<com.clone.notion.model.Block>) convexData.get("blocks"))
                .build();

        Page synced = pageService.syncWithConvex(pageId, convexPage, userId);
        return synced != null ? ResponseEntity.ok(synced) : ResponseEntity.status(403).build();
    }

    @GetMapping("/pages/{pageId}/status")
    public ResponseEntity<Map<String, Object>> getCollaborativeStatus(@PathVariable String pageId) {
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
    }

    @PostMapping("/pages/{pageId}/disconnect")
    public ResponseEntity<Page> disconnectFromConvex(@PathVariable String pageId) {
        String userId = getAuthenticatedUser().getId();
        Page updated = pageService.updateConvexDocId(pageId, null, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
    }

    @GetMapping("/pages/search")
    public ResponseEntity<List<Page>> searchCollaborativePages(@RequestParam String query) {
        String userId = getAuthenticatedUser().getId();
        List<Page> results = pageService.searchPages(query, userId);
        
        // Filter to only return pages with collaborative editing enabled
        List<Page> collaborativePages = results.stream()
                .filter(page -> page.getConvexDocId() != null)
                .collect(Collectors.toList());

        return ResponseEntity.ok(collaborativePages);
    }

    @PostMapping("/pages/{pageId}/merge")
    public ResponseEntity<Page> mergeConvexChanges(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> mergeData) {
        
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
        
        page.setUpdatedAt(java.time.Instant.now());
        Page merged = pageService.update(pageId, page, userId);
        
        return merged != null ? ResponseEntity.ok(merged) : ResponseEntity.status(403).build();
    }
}

