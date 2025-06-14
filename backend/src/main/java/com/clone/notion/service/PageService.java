package com.clone.notion.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.clone.notion.model.Page;
import com.clone.notion.repository.PageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PageService {

    private final PageRepository pageRepository;

    public List<Page> findAllByUserId(String userId) {
        return pageRepository.findByUserId(userId);
    }

    public Page findById(String id) {
        return pageRepository.findById(id).orElse(null);
    }

    public Page create(Page page, String userId) {
        page.setUserId(userId);
        page.setCreatedAt(Instant.now());
        page.setUpdatedAt(Instant.now());
        return pageRepository.save(page);
    }

    public Page update(String id, Page updated, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (!existing.getUserId().equals(userId)) {
                return null; // Or throw an exception for forbidden access
            }
            existing.setTitle(updated.getTitle());
            existing.setParentId(updated.getParentId());
            existing.setIcon(updated.getIcon());
            existing.setBlocks(updated.getBlocks());
            existing.setConvexDocId(updated.getConvexDocId());
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public boolean delete(String id, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (!existing.getUserId().equals(userId)) {
                return false;
            }
            pageRepository.delete(existing);
            return true;
        }).orElse(false);
    }

    // New methods for collaborative editing

    public Page updateConvexDocId(String id, String convexDocId, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (!existing.getUserId().equals(userId)) {
                return null;
            }
            existing.setConvexDocId(convexDocId);
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public Page syncWithConvex(String id, Page convexPage, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (!existing.getUserId().equals(userId)) {
                return null;
            }
            // Sync content from Convex while preserving metadata
            existing.setTitle(convexPage.getTitle());
            existing.setBlocks(convexPage.getBlocks());
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public List<Page> searchPages(String query, String userId) {
        if (query == null || query.trim().isEmpty()) {
            return pageRepository.findByUserId(userId);
        }
        return pageRepository.searchByUserIdAndContent(userId, query.trim());
    }

    public Page updateTitle(String id, String title, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (!existing.getUserId().equals(userId)) {
                return null;
            }
            existing.setTitle(title);
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public Page updateIcon(String id, String icon, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (!existing.getUserId().equals(userId)) {
                return null;
            }
            existing.setIcon(icon);
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    // Additional methods for collaborative editing

    public List<Page> findCollaborativePagesByUserId(String userId) {
        return pageRepository.findCollaborativePagesByUserId(userId);
    }

    public Page findByConvexDocId(String convexDocId) {
        return pageRepository.findByConvexDocId(convexDocId).orElse(null);
    }

    public boolean isConvexDocIdAvailable(String convexDocId) {
        return !pageRepository.existsByConvexDocId(convexDocId);
    }
} 