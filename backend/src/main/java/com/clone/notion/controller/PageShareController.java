package com.clone.notion.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.PageShare;
import com.clone.notion.model.Permission;
import com.clone.notion.service.PageShareService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shares")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class PageShareController {

    private final PageShareService pageShareService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @PostMapping("/page/{pageId}/share")
    public ResponseEntity<PageShare> sharePageWithUser(
            @PathVariable String pageId,
            @RequestBody Map<String, String> request) {
        try {
            String sharedByUserId = getAuthenticatedUser().getId();
            String sharedWithUserId = request.get("userId");
            String permission = request.get("permission");

            // Validate permission
            try {
                Permission.valueOf(permission.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }

            PageShare share = pageShareService.sharePageWithUser(pageId, sharedByUserId, sharedWithUserId, permission);
            return ResponseEntity.ok(share);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/page/{pageId}/public")
    public ResponseEntity<PageShare> createPublicShare(
            @PathVariable String pageId,
            @RequestBody Map<String, Object> request) {
        try {
            String sharedByUserId = getAuthenticatedUser().getId();
            String permission = (String) request.get("permission");
            String expiresAtStr = (String) request.get("expiresAt");

            // Validate permission
            try {
                Permission.valueOf(permission.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }

            Instant expiresAt = null;
            if (expiresAtStr != null && !expiresAtStr.isEmpty()) {
                expiresAt = Instant.parse(expiresAtStr);
            }

            PageShare share = pageShareService.createPublicShare(pageId, sharedByUserId, permission, expiresAt);
            return ResponseEntity.ok(share);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page/{pageId}")
    public ResponseEntity<List<PageShare>> getSharesForPage(@PathVariable String pageId) {
        try {
            List<PageShare> shares = pageShareService.getSharesForPage(pageId);
            return ResponseEntity.ok(shares);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/by-user")
    public ResponseEntity<List<PageShare>> getSharesByUser() {
        try {
            String userId = getAuthenticatedUser().getId();
            List<PageShare> shares = pageShareService.getSharesByUser(userId);
            return ResponseEntity.ok(shares);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/with-user")
    public ResponseEntity<List<PageShare>> getSharesWithUser() {
        try {
            String userId = getAuthenticatedUser().getId();
            List<PageShare> shares = pageShareService.getSharesWithUser(userId);
            return ResponseEntity.ok(shares);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/link/{shareLink}")
    public ResponseEntity<PageShare> getShareByLink(@PathVariable String shareLink) {
        try {
            return pageShareService.getShareByLink(shareLink)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/page/{pageId}/access")
    public ResponseEntity<Map<String, Boolean>> checkAccess(
            @PathVariable String pageId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = getAuthenticatedUser().getId();
            String requiredPermission = request.get("permission");

            boolean hasAccess = pageShareService.hasAccess(pageId, userId, requiredPermission);
            return ResponseEntity.ok(Map.of("hasAccess", hasAccess));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/page/{pageId}/user/{userId}")
    public ResponseEntity<Void> revokeShare(
            @PathVariable String pageId,
            @PathVariable String userId) {
        try {
            String revokedByUserId = getAuthenticatedUser().getId();
            pageShareService.revokeShare(pageId, userId, revokedByUserId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/page/{pageId}/public")
    public ResponseEntity<Void> revokePublicShare(@PathVariable String pageId) {
        try {
            String revokedByUserId = getAuthenticatedUser().getId();
            pageShareService.revokePublicShare(pageId, revokedByUserId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/page/{pageId}/user/{userId}/permission")
    public ResponseEntity<PageShare> updateSharePermission(
            @PathVariable String pageId,
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        try {
            String updatedByUserId = getAuthenticatedUser().getId();
            String newPermission = request.get("permission");

            // Validate permission
            try {
                Permission.valueOf(newPermission.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }

            pageShareService.updateSharePermission(pageId, userId, newPermission, updatedByUserId);
            
            // Return updated share
            return pageShareService.getSharesForPage(pageId).stream()
                .filter(share -> share.getSharedWithUserId().equals(userId))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/permissions")
    public ResponseEntity<Map<String, Object>> getAvailablePermissions() {
        try {
            Map<String, Object> permissions = Map.of(
                "permissions", Permission.values(),
                "descriptions", Map.of(
                    "VIEW", "Can view the page",
                    "COMMENT", "Can view and add comments",
                    "EDIT", "Can view, comment, and edit the page",
                    "ADMIN", "Full access including sharing and deletion"
                )
            );
            return ResponseEntity.ok(permissions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Integer>> cleanupExpiredShares() {
        try {
            List<PageShare> expiredShares = pageShareService.getExpiredShares();
            pageShareService.cleanupExpiredShares();
            return ResponseEntity.ok(Map.of("cleanedShares", expiredShares.size()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 