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
    private final PageLinkService pageLinkService;

    public List<Page> findAllByUserId(String userId) {
        return pageRepository.findByUserIdOrderByParentIdAscOrderAsc(userId);
    }

    public Page findById(String id) {
        return pageRepository.findById(id).orElse(null);
    }

    public Page create(Page page, String userId) {
        System.out.println("[DEBUG] Creating page for userId: " + userId);
        page.setUserId(userId);
        page.setCreatedAt(Instant.now());
        page.setUpdatedAt(Instant.now());
        
        // Set default order if not provided
        if (page.getOrder() == null) {
            page.setOrder(getNextOrderForParent(userId, page.getParentId()));
        }
        
        return pageRepository.save(page);
    }

    public Page update(String id, Page updated, String userId) {
        try {
            System.out.println("[DEBUG] PageService.update called with id: " + id + ", userId: " + userId);
            
            return pageRepository.findById(id).map(existing -> {
                System.out.println("[DEBUG] Found existing page: " + existing);
                
                if (existing.getUserId() == null) {
                    System.out.println("[ERROR] Page has null userId: " + id);
                    return null;
                }
                
                if (!existing.getUserId().equals(userId)) {
                    System.out.println("[ERROR] User not authorized to update page. Page owner: " + existing.getUserId() + ", requester: " + userId);
                    return null;
                }
                
                // Only update fields that are not null in the updated object
                if (updated.getTitle() != null) {
                    existing.setTitle(updated.getTitle());
                }
                
                if (updated.getParentId() != null) {
                    existing.setParentId(updated.getParentId());
                }
                
                if (updated.getIcon() != null) {
                    existing.setIcon(updated.getIcon());
                }
                
                if (updated.getBlocks() != null) {
                    existing.setBlocks(updated.getBlocks());
                }
                
                if (updated.getConvexDocId() != null) {
                    existing.setConvexDocId(updated.getConvexDocId());
                }
                
                existing.setUpdatedAt(Instant.now());
                
                try {
                    Page savedPage = pageRepository.save(existing);
                    System.out.println("[DEBUG] Page updated successfully: " + savedPage);
                    return savedPage;
                } catch (Exception e) {
                    System.out.println("[ERROR] Exception saving page: " + e.getMessage());
                    e.printStackTrace();
                    return null;
                }
            }).orElseGet(() -> {
                System.out.println("[ERROR] Page not found with id: " + id);
                return null;
            });
        } catch (Exception e) {
            System.out.println("[ERROR] Exception in update method: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean delete(String id, String userId) {
        System.out.println("PageService.delete called with id: " + id + ", userId: " + userId);
        
        return pageRepository.findById(id).map(existing -> {
            System.out.println("Found page: " + existing.getTitle() + ", owner: " + existing.getUserId());
            
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                System.out.println("User not authorized to delete this page");
                return false;
            }
            
            System.out.println("Deleting page: " + existing.getTitle());
            
            // Clean up all links for this page before deleting
            pageLinkService.removeAllLinksForPage(id);
            
            pageRepository.delete(existing);
            System.out.println("Page deleted successfully");
            return true;
        }).orElse(false);
    }

    // New methods for collaborative editing

    public Page updateConvexDocId(String id, String convexDocId, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                return null;
            }
            existing.setConvexDocId(convexDocId);
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public Page syncWithConvex(String id, Page convexPage, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
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
        System.out.println("[DEBUG] searchPages called with query: '" + query + "', userId: " + userId);
        if (query == null || query.trim().isEmpty()) {
            return pageRepository.findByUserIdOrderByParentIdAscOrderAsc(userId);
        }
        List<Page> results = pageRepository.searchByUserIdAndContent(userId, query.trim());
        System.out.println("[DEBUG] searchPages found " + results.size() + " results");
        return results;
    }

    public Page updateTitle(String id, String title, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                return null;
            }
            existing.setTitle(title);
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public Page updateIcon(String id, String icon, String userId) {
        return pageRepository.findById(id).map(existing -> {
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
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

    // New methods for hierarchical page management

    public Page movePage(String pageId, String newParentId, Integer newOrder, String userId) {
        return pageRepository.findById(pageId).map(existing -> {
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                return null;
            }
            
            String oldParentId = existing.getParentId();
            Integer oldOrder = existing.getOrder();
            
            // Update parent and order
            existing.setParentId(newParentId);
            existing.setOrder(newOrder);
            existing.setUpdatedAt(Instant.now());
            
            // Reorder siblings in old parent
            if (oldParentId != null && !oldParentId.equals(newParentId)) {
                reorderSiblingsAfterMove(userId, oldParentId, oldOrder);
            }
            
            // Reorder siblings in new parent
            if (newParentId != null) {
                reorderSiblingsAfterInsert(userId, newParentId, newOrder);
            }
            
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public Page updateOrder(String pageId, Integer newOrder, String userId) {
        return pageRepository.findById(pageId).map(existing -> {
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                return null;
            }
            
            Integer oldOrder = existing.getOrder();
            String parentId = existing.getParentId();
            
            existing.setOrder(newOrder);
            existing.setUpdatedAt(Instant.now());
            
            // Reorder siblings
            if (parentId != null) {
                reorderSiblingsAfterMove(userId, parentId, oldOrder);
                reorderSiblingsAfterInsert(userId, parentId, newOrder);
            }
            
            return pageRepository.save(existing);
        }).orElse(null);
    }

    private Integer getNextOrderForParent(String userId, String parentId) {
        List<Page> siblings = pageRepository.findByUserIdAndParentIdOrderByOrderAsc(userId, parentId);
        if (siblings.isEmpty()) {
            return 0;
        }
        
        // Find the maximum order value, handling null orders
        Integer maxOrder = 0;
        for (Page sibling : siblings) {
            Integer order = sibling.getOrder();
            if (order != null && order > maxOrder) {
                maxOrder = order;
            }
        }
        
        return maxOrder + 1;
    }

    private void reorderSiblingsAfterMove(String userId, String parentId, Integer removedOrder) {
        if (removedOrder == null) return; // Skip if no order to remove
        
        List<Page> siblings = pageRepository.findByUserIdAndParentIdOrderByOrderAsc(userId, parentId);
        for (Page sibling : siblings) {
            Integer order = sibling.getOrder();
            if (order != null && order > removedOrder) {
                sibling.setOrder(order - 1);
                pageRepository.save(sibling);
            }
        }
    }

    private void reorderSiblingsAfterInsert(String userId, String parentId, Integer insertedOrder) {
        if (insertedOrder == null) return; // Skip if no order to insert
        
        List<Page> siblings = pageRepository.findByUserIdAndParentIdOrderByOrderAsc(userId, parentId);
        for (Page sibling : siblings) {
            Integer order = sibling.getOrder();
            if (order != null && order >= insertedOrder) {
                sibling.setOrder(order + 1);
                pageRepository.save(sibling);
            }
        }
    }
} 