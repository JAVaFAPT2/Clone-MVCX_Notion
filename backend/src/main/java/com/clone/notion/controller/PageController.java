package com.clone.notion.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Page;
import com.clone.notion.service.PageService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.clone.notion.payload.request.MovePageRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pages")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
        System.out.println("[DEBUG] getAuthenticatedUser: username=" + user.getUsername() + ", id=" + user.getId());
        return user;
    }

    @GetMapping
    public ResponseEntity<List<Page>> getAll() {
        try {
            String userId = getAuthenticatedUser().getId();
            List<Page> pages = pageService.findAllByUserId(userId);
            return ResponseEntity.ok(pages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getById(@PathVariable String id) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page page = pageService.findById(id);

            if (page == null || page.getUserId() == null || !page.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(page);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Page> create(@RequestBody Page page) {
        try {
            System.out.println("[DEBUG] Received page in create: " + page);
            String userId = getAuthenticatedUser().getId();
            Page created = pageService.create(page, userId);
            System.out.println("[DEBUG] Created page: " + created);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.out.println("[ERROR] Exception in create page: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Page> update(@PathVariable String id, @RequestBody Page page) {
        try {
            String userId = getAuthenticatedUser().getId();
            System.out.println("[DEBUG] Update request for page ID: " + id + " by user ID: " + userId);
            System.out.println("[DEBUG] Update payload: " + page);
            
            Page existing = pageService.findById(id);
            if (existing == null) {
                System.out.println("[ERROR] Page not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("[DEBUG] Existing page: " + existing);
            
            if (existing.getUserId() == null) {
                System.out.println("[ERROR] Page has null userId: " + id);
                return ResponseEntity.status(403).build();
            }
            
            if (!existing.getUserId().equals(userId)) {
                System.out.println("[ERROR] User not authorized to update page. Page owner: " + existing.getUserId() + ", requester: " + userId);
                return ResponseEntity.status(403).build();
            }
            
            Page updated = pageService.update(id, page, userId);
            if (updated == null) {
                System.out.println("[ERROR] Failed to update page: " + id);
                return ResponseEntity.status(500).build();
            }
            
            System.out.println("[DEBUG] Page updated successfully: " + updated);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("[ERROR] Exception in update page: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            String userId = getAuthenticatedUser().getId();
            System.out.println("Delete request for page ID: " + id + " by user ID: " + userId);
            
            boolean deleted = pageService.delete(id, userId);
            System.out.println("Delete result: " + deleted);
            
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                System.out.println("Delete failed - page not found or user not authorized");
                return ResponseEntity.status(403).build();
            }
        } catch (Exception e) {
            System.out.println("Exception during delete: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // New endpoints for collaborative editing

    @PutMapping("/{id}/convex-doc")
    public ResponseEntity<Page> updateConvexDocId(@PathVariable String id, @RequestBody String convexDocId) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page updated = pageService.updateConvexDocId(id, convexDocId, userId);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/convex-doc")
    public ResponseEntity<String> getConvexDocId(@PathVariable String id) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page page = pageService.findById(id);
            
            if (page == null || page.getUserId() == null || !page.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(page.getConvexDocId());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<Page> syncWithConvex(@PathVariable String id, @RequestBody Page convexPage) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page synced = pageService.syncWithConvex(id, convexPage, userId);
            return synced != null ? ResponseEntity.ok(synced) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Page>> searchPages(@RequestParam String query) {
        try {
            String userId = getAuthenticatedUser().getId();
            List<Page> results = pageService.searchPages(query, userId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/title")
    public ResponseEntity<Page> updateTitle(@PathVariable String id, @RequestBody String title) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page updated = pageService.updateTitle(id, title, userId);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/icon")
    public ResponseEntity<Page> updateIcon(@PathVariable String id, @RequestBody String icon) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page updated = pageService.updateIcon(id, icon, userId);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // New endpoints for hierarchical page management

    @PutMapping("/{id}/move")
    public ResponseEntity<Page> movePage(
            @PathVariable String id, 
            @RequestBody MovePageRequest request) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page moved = pageService.movePage(id, request.getNewParentId(), request.getNewOrder(), userId);
            return moved != null ? ResponseEntity.ok(moved) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/order")
    public ResponseEntity<Page> updateOrder(
            @PathVariable String id, 
            @RequestBody Integer newOrder) {
        try {
            String userId = getAuthenticatedUser().getId();
            Page updated = pageService.updateOrder(id, newOrder, userId);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 