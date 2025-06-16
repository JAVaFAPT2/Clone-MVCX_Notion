package com.clone.notion.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Template;
import com.clone.notion.service.TemplateService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<Template> createTemplate(@RequestBody Map<String, Object> request) {
        try {
            String createdByUserId = getAuthenticatedUser().getId();
            String createdByUsername = getAuthenticatedUser().getUsername();
            
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            String category = (String) request.get("category");
            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) request.get("content");
            @SuppressWarnings("unchecked")
            List<String> tags = (List<String>) request.get("tags");
            @SuppressWarnings("unchecked")
            List<String> blocks = (List<String>) request.get("blocks");
            Boolean isPublic = (Boolean) request.get("isPublic");

            Template template = templateService.createTemplate(
                name, description, category, createdByUserId, createdByUsername,
                content, tags, blocks, isPublic != null ? isPublic : false
            );
            
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Template>> getAllTemplates() {
        try {
            List<Template> templates = templateService.getAllPublicTemplates();
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Template>> getTemplatesByCategory(@PathVariable String category) {
        try {
            List<Template> templates = templateService.getTemplatesByCategory(category);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/creator")
    public ResponseEntity<List<Template>> getTemplatesByCreator() {
        try {
            String userId = getAuthenticatedUser().getId();
            List<Template> templates = templateService.getTemplatesByCreator(userId);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/official")
    public ResponseEntity<List<Template>> getOfficialTemplates() {
        try {
            List<Template> templates = templateService.getOfficialTemplates();
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Template>> searchTemplates(@RequestParam String q) {
        try {
            List<Template> templates = templateService.searchTemplates(q);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/tags")
    public ResponseEntity<List<Template>> getTemplatesByTags(@RequestParam List<String> tags) {
        try {
            List<Template> templates = templateService.getTemplatesByTags(tags);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/shared")
    public ResponseEntity<List<Template>> getSharedTemplates() {
        try {
            String userId = getAuthenticatedUser().getId();
            List<Template> templates = templateService.getTemplatesSharedWithUser(userId);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Template>> getMostPopularTemplates() {
        try {
            List<Template> templates = templateService.getMostPopularTemplates();
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Template>> getRecentlyUsedTemplates() {
        try {
            List<Template> templates = templateService.getRecentlyUsedTemplates();
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/rating")
    public ResponseEntity<List<Template>> getTemplatesByRating(@RequestParam double minRating) {
        try {
            List<Template> templates = templateService.getTemplatesByRating(minRating);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/usage")
    public ResponseEntity<List<Template>> getTemplatesByUsage(@RequestParam int minUsage) {
        try {
            List<Template> templates = templateService.getTemplatesByUsage(minUsage);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<Template> getTemplateById(@PathVariable String templateId) {
        try {
            return templateService.getTemplateById(templateId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{templateId}")
    public ResponseEntity<Template> updateTemplate(
            @PathVariable String templateId,
            @RequestBody Map<String, Object> request) {
        try {
            String updatedByUserId = getAuthenticatedUser().getId();
            
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            String category = (String) request.get("category");
            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) request.get("content");
            @SuppressWarnings("unchecked")
            List<String> tags = (List<String>) request.get("tags");
            @SuppressWarnings("unchecked")
            List<String> blocks = (List<String>) request.get("blocks");
            String icon = (String) request.get("icon");
            String color = (String) request.get("color");

            Template template = templateService.updateTemplate(
                templateId, name, description, category, content, tags, blocks, icon, color, updatedByUserId
            );
            
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String templateId) {
        try {
            String deletedByUserId = getAuthenticatedUser().getId();
            templateService.deleteTemplate(templateId, deletedByUserId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{templateId}/use")
    public ResponseEntity<Template> useTemplate(@PathVariable String templateId) {
        try {
            String usedByUserId = getAuthenticatedUser().getId();
            Template template = templateService.useTemplate(templateId, usedByUserId);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{templateId}/rate")
    public ResponseEntity<Template> rateTemplate(
            @PathVariable String templateId,
            @RequestBody Map<String, Object> request) {
        try {
            String ratedByUserId = getAuthenticatedUser().getId();
            Double rating = (Double) request.get("rating");
            
            if (rating == null) {
                return ResponseEntity.badRequest().build();
            }

            Template template = templateService.rateTemplate(templateId, rating, ratedByUserId);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{templateId}/share")
    public ResponseEntity<Template> shareTemplate(
            @PathVariable String templateId,
            @RequestBody Map<String, String> request) {
        try {
            String sharedByUserId = getAuthenticatedUser().getId();
            String sharedWithUserId = request.get("userId");

            Template template = templateService.shareTemplate(templateId, sharedWithUserId, sharedByUserId);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{templateId}/share/{userId}")
    public ResponseEntity<Template> unshareTemplate(
            @PathVariable String templateId,
            @PathVariable String userId) {
        try {
            String unsharedByUserId = getAuthenticatedUser().getId();
            Template template = templateService.unshareTemplate(templateId, userId, unsharedByUserId);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAvailableCategories() {
        try {
            List<String> categories = templateService.getAvailableCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getTemplateStats() {
        try {
            Map<String, Long> stats = templateService.getTemplateStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/initialize")
    public ResponseEntity<Map<String, String>> initializeDefaultTemplates() {
        try {
            templateService.initializeDefaultTemplates();
            return ResponseEntity.ok(Map.of("message", "Default templates initialized successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 