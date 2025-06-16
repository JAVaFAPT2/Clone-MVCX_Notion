package com.clone.notion.controller;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
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
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class SearchController {

    private final PageService pageService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<List<Page>> globalSearch(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "all") String pageType,
            @RequestParam(required = false, defaultValue = "all") String dateRange,
            @RequestParam(required = false, defaultValue = "all") String contentType) {
        
        try {
            String userId = getAuthenticatedUser().getId();
            List<Page> allResults = pageService.searchPages(query, userId);
            
            // Apply filters
            List<Page> filteredResults = allResults.stream()
                .filter(page -> filterByPageType(page, pageType))
                .filter(page -> filterByDateRange(page, dateRange))
                .filter(page -> filterByContentType(page, contentType, query))
                .collect(Collectors.toList());

            return ResponseEntity.ok(filteredResults);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private boolean filterByPageType(Page page, String pageType) {
        if ("all".equals(pageType)) {
            return true;
        }
        
        switch (pageType) {
            case "collaborative":
                return page.getConvexDocId() != null;
            case "regular":
                return page.getConvexDocId() == null;
            default:
                return true;
        }
    }

    private boolean filterByDateRange(Page page, String dateRange) {
        if ("all".equals(dateRange) || page.getUpdatedAt() == null) {
            return true;
        }

        LocalDateTime pageDate = page.getUpdatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime now = LocalDateTime.now();
        
        switch (dateRange) {
            case "today":
                return pageDate.toLocalDate().equals(now.toLocalDate());
            case "week":
                return pageDate.isAfter(now.minusWeeks(1));
            case "month":
                return pageDate.isAfter(now.minusMonths(1));
            case "year":
                return pageDate.isAfter(now.minusYears(1));
            default:
                return true;
        }
    }

    private boolean filterByContentType(Page page, String contentType, String query) {
        if ("all".equals(contentType)) {
            return true;
        }

        String queryLower = query.toLowerCase();
        
        switch (contentType) {
            case "title":
                return page.getTitle() != null && 
                       page.getTitle().toLowerCase().contains(queryLower);
            case "content":
                return page.getBlocks() != null && 
                       page.getBlocks().stream()
                           .anyMatch(block -> block.getContent() != null && 
                                            block.getContent().toLowerCase().contains(queryLower));
            case "links":
                return page.getLinkedPageIds() != null && 
                       page.getLinkedPageIds().size() > 0;
            default:
                return true;
        }
    }
} 