package com.clone.notion.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Page;
import com.clone.notion.model.PageLink;
import com.clone.notion.service.PageLinkService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/page-links")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class PageLinkController {

    private final PageLinkService pageLinkService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<PageLink> createLink(@RequestBody Map<String, Object> request) {
        try {
            String sourcePageId = (String) request.get("sourcePageId");
            String targetPageId = (String) request.get("targetPageId");
            String linkText = (String) request.get("linkText");
            String blockId = (String) request.get("blockId");
            Integer position = (Integer) request.get("position");

            PageLink link = pageLinkService.createLink(sourcePageId, targetPageId, linkText, blockId, position);
            return ResponseEntity.ok(link);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{sourcePageId}/{targetPageId}/{blockId}")
    public ResponseEntity<Void> removeLink(
            @PathVariable String sourcePageId,
            @PathVariable String targetPageId,
            @PathVariable String blockId) {
        try {
            pageLinkService.removeLink(sourcePageId, targetPageId, blockId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/from/{pageId}")
    public ResponseEntity<List<PageLink>> getLinksFromPage(@PathVariable String pageId) {
        try {
            List<PageLink> links = pageLinkService.getLinksFromPage(pageId);
            return ResponseEntity.ok(links);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/to/{pageId}")
    public ResponseEntity<List<PageLink>> getBacklinksToPage(@PathVariable String pageId) {
        try {
            List<PageLink> backlinks = pageLinkService.getBacklinksToPage(pageId);
            return ResponseEntity.ok(backlinks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{pageId}/linked-pages")
    public ResponseEntity<List<Page>> getLinkedPages(@PathVariable String pageId) {
        try {
            List<Page> pages = pageLinkService.getLinkedPages(pageId);
            return ResponseEntity.ok(pages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{pageId}/backlink-pages")
    public ResponseEntity<List<Page>> getBacklinkPages(@PathVariable String pageId) {
        try {
            List<Page> pages = pageLinkService.getBacklinkPages(pageId);
            return ResponseEntity.ok(pages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Page>> searchPagesByLinkText(@RequestParam String query) {
        try {
            String userId = getAuthenticatedUser().getId();
            List<Page> pages = pageLinkService.searchPagesByLinkText(userId, query);
            return ResponseEntity.ok(pages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/page/{pageId}")
    public ResponseEntity<Void> removeAllLinksForPage(@PathVariable String pageId) {
        try {
            pageLinkService.removeAllLinksForPage(pageId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 