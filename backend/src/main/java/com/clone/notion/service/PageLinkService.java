package com.clone.notion.service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.clone.notion.model.Page;
import com.clone.notion.model.PageLink;
import com.clone.notion.repository.PageLinkRepository;
import com.clone.notion.repository.PageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PageLinkService {

    private final PageLinkRepository pageLinkRepository;
    private final PageRepository pageRepository;

    /**
     * Create a link from source page to target page
     */
    public PageLink createLink(String sourcePageId, String targetPageId, String linkText, String blockId, Integer position) {
        // Verify both pages exist
        Page sourcePage = pageRepository.findById(sourcePageId).orElse(null);
        Page targetPage = pageRepository.findById(targetPageId).orElse(null);
        
        if (sourcePage == null || targetPage == null) {
            throw new IllegalArgumentException("Source or target page not found");
        }

        // Check if link already exists
        Optional<PageLink> existingLink = pageLinkRepository.findBySourcePageIdAndTargetPageIdAndBlockId(
            sourcePageId, targetPageId, blockId);
        
        if (existingLink.isPresent()) {
            return existingLink.get();
        }

        // Create new link
        PageLink link = PageLink.builder()
            .sourcePageId(sourcePageId)
            .targetPageId(targetPageId)
            .linkText(linkText)
            .blockId(blockId)
            .position(position)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        PageLink savedLink = pageLinkRepository.save(link);

        // Update page link sets
        updatePageLinkSets(sourcePageId, targetPageId);

        return savedLink;
    }

    /**
     * Remove a link
     */
    public void removeLink(String sourcePageId, String targetPageId, String blockId) {
        Optional<PageLink> link = pageLinkRepository.findBySourcePageIdAndTargetPageIdAndBlockId(
            sourcePageId, targetPageId, blockId);
        
        if (link.isPresent()) {
            pageLinkRepository.delete(link.get());
            updatePageLinkSets(sourcePageId, targetPageId);
        }
    }

    /**
     * Get all links from a page
     */
    public List<PageLink> getLinksFromPage(String pageId) {
        return pageLinkRepository.findBySourcePageId(pageId);
    }

    /**
     * Get all backlinks to a page
     */
    public List<PageLink> getBacklinksToPage(String pageId) {
        return pageLinkRepository.findByTargetPageId(pageId);
    }

    /**
     * Get pages that link to the given page
     */
    public List<Page> getBacklinkPages(String pageId) {
        List<PageLink> backlinks = pageLinkRepository.findByTargetPageId(pageId);
        List<String> sourcePageIds = backlinks.stream()
            .map(PageLink::getSourcePageId)
            .distinct()
            .collect(Collectors.toList());
        
        return pageRepository.findAllById(sourcePageIds);
    }

    /**
     * Get pages that the given page links to
     */
    public List<Page> getLinkedPages(String pageId) {
        List<PageLink> links = pageLinkRepository.findBySourcePageId(pageId);
        List<String> targetPageIds = links.stream()
            .map(PageLink::getTargetPageId)
            .distinct()
            .collect(Collectors.toList());
        
        return pageRepository.findAllById(targetPageIds);
    }

    /**
     * Update page link sets when links change
     */
    private void updatePageLinkSets(String sourcePageId, String targetPageId) {
        // Update source page's linkedPageIds
        Page sourcePage = pageRepository.findById(sourcePageId).orElse(null);
        if (sourcePage != null) {
            List<PageLink> links = pageLinkRepository.findBySourcePageId(sourcePageId);
            Set<String> linkedIds = links.stream()
                .map(PageLink::getTargetPageId)
                .collect(Collectors.toSet());
            sourcePage.setLinkedPageIds(linkedIds);
            pageRepository.save(sourcePage);
        }

        // Update target page's backlinkPageIds
        Page targetPage = pageRepository.findById(targetPageId).orElse(null);
        if (targetPage != null) {
            List<PageLink> backlinks = pageLinkRepository.findByTargetPageId(targetPageId);
            Set<String> backlinkIds = backlinks.stream()
                .map(PageLink::getSourcePageId)
                .collect(Collectors.toSet());
            targetPage.setBacklinkPageIds(backlinkIds);
            pageRepository.save(targetPage);
        }
    }

    /**
     * Remove all links when a page is deleted
     */
    public void removeAllLinksForPage(String pageId) {
        pageLinkRepository.deleteBySourcePageId(pageId);
        pageLinkRepository.deleteByTargetPageId(pageId);
    }

    /**
     * Search for pages by link text
     */
    public List<Page> searchPagesByLinkText(String userId, String searchText) {
        List<PageLink> links = pageLinkRepository.findByPageIds(
            pageRepository.findByUserIdOrderByParentIdAscOrderAsc(userId)
                .stream()
                .map(Page::getId)
                .collect(Collectors.toList())
        );
        
        List<String> pageIds = links.stream()
            .filter(link -> link.getLinkText() != null && 
                    link.getLinkText().toLowerCase().contains(searchText.toLowerCase()))
            .map(PageLink::getTargetPageId)
            .distinct()
            .collect(Collectors.toList());
        
        return pageRepository.findAllById(pageIds);
    }
} 