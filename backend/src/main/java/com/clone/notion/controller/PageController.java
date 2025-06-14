package com.clone.notion.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Page;
import com.clone.notion.service.PageService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pages")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @GetMapping
    public List<Page> getAll() {
        String userId = getAuthenticatedUser().getId();
        return pageService.findAllByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getById(@PathVariable String id) {
        String userId = getAuthenticatedUser().getId();
        Page page = pageService.findById(id);

        if (page == null || !page.getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(page);
    }

    @PostMapping
    public ResponseEntity<Page> create(@RequestBody Page page) {
        String userId = getAuthenticatedUser().getId();
        Page created = pageService.create(page, userId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Page> update(@PathVariable String id, @RequestBody Page page) {
        String userId = getAuthenticatedUser().getId();
        Page updated = pageService.update(id, page, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        String userId = getAuthenticatedUser().getId();
        boolean deleted = pageService.delete(id, userId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(403).build();
        }
    }

    // New endpoints for collaborative editing

    @PutMapping("/{id}/convex-doc")
    public ResponseEntity<Page> updateConvexDocId(@PathVariable String id, @RequestBody String convexDocId) {
        String userId = getAuthenticatedUser().getId();
        Page updated = pageService.updateConvexDocId(id, convexDocId, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
    }

    @GetMapping("/{id}/convex-doc")
    public ResponseEntity<String> getConvexDocId(@PathVariable String id) {
        String userId = getAuthenticatedUser().getId();
        Page page = pageService.findById(id);
        
        if (page == null || !page.getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(page.getConvexDocId());
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<Page> syncWithConvex(@PathVariable String id, @RequestBody Page convexPage) {
        String userId = getAuthenticatedUser().getId();
        Page synced = pageService.syncWithConvex(id, convexPage, userId);
        return synced != null ? ResponseEntity.ok(synced) : ResponseEntity.status(403).build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Page>> searchPages(@RequestParam String query) {
        String userId = getAuthenticatedUser().getId();
        List<Page> results = pageService.searchPages(query, userId);
        return ResponseEntity.ok(results);
    }

    @PutMapping("/{id}/title")
    public ResponseEntity<Page> updateTitle(@PathVariable String id, @RequestBody String title) {
        String userId = getAuthenticatedUser().getId();
        Page updated = pageService.updateTitle(id, title, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
    }

    @PutMapping("/{id}/icon")
    public ResponseEntity<Page> updateIcon(@PathVariable String id, @RequestBody String icon) {
        String userId = getAuthenticatedUser().getId();
        Page updated = pageService.updateIcon(id, icon, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
    }
} 