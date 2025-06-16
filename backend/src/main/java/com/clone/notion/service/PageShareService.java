package com.clone.notion.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.clone.notion.model.PageShare;
import com.clone.notion.model.Permission;
import com.clone.notion.repository.PageShareRepository;
import com.clone.notion.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PageShareService {

    private final PageShareRepository pageShareRepository;
    private final UserRepository userRepository;

    public PageShare sharePageWithUser(String pageId, String sharedByUserId, String sharedWithUserId, String permission) {
        // Validate permission
        Permission.valueOf(permission.toUpperCase());
        
        // Check if user exists
        if (!userRepository.existsById(sharedWithUserId)) {
            throw new IllegalArgumentException("User not found");
        }
        
        // Check if share already exists
        Optional<PageShare> existingShare = pageShareRepository.findByPageIdAndSharedWithUserIdAndActiveTrue(pageId, sharedWithUserId);
        if (existingShare.isPresent()) {
            // Update existing share
            PageShare share = existingShare.get();
            share.setPermission(permission);
            share.setUpdatedAt(Instant.now());
            return pageShareRepository.save(share);
        }
        
        // Create new share
        PageShare share = PageShare.builder()
            .pageId(pageId)
            .sharedByUserId(sharedByUserId)
            .sharedWithUserId(sharedWithUserId)
            .permission(permission)
            .active(true)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .isPublic(false)
            .build();
        
        return pageShareRepository.save(share);
    }

    public PageShare createPublicShare(String pageId, String sharedByUserId, String permission, Instant expiresAt) {
        // Validate permission
        Permission.valueOf(permission.toUpperCase());
        
        // Generate unique share link
        String shareLink = generateShareLink();
        
        PageShare share = PageShare.builder()
            .pageId(pageId)
            .sharedByUserId(sharedByUserId)
            .sharedWithUserId(null) // Public share
            .permission(permission)
            .active(true)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .expiresAt(expiresAt)
            .shareLink(shareLink)
            .isPublic(true)
            .build();
        
        return pageShareRepository.save(share);
    }

    public List<PageShare> getSharesForPage(String pageId) {
        return pageShareRepository.findByPageIdAndActiveTrue(pageId);
    }

    public List<PageShare> getSharesByUser(String userId) {
        return pageShareRepository.findBySharedByUserIdAndActiveTrue(userId);
    }

    public List<PageShare> getSharesWithUser(String userId) {
        return pageShareRepository.findBySharedWithUserIdAndActiveTrue(userId);
    }

    public Optional<PageShare> getShareByLink(String shareLink) {
        return pageShareRepository.findByShareLinkAndActiveTrue(shareLink);
    }

    public boolean hasAccess(String pageId, String userId, String requiredPermission) {
        // Check if user owns the page (implicit full access)
        // This would need to be implemented based on your page ownership logic
        
        // Check explicit shares
        Optional<PageShare> share = pageShareRepository.findByPageIdAndSharedWithUserIdAndActiveTrue(pageId, userId);
        if (share.isPresent()) {
            PageShare pageShare = share.get();
            
            // Check if share is expired
            if (pageShare.getExpiresAt() != null && pageShare.getExpiresAt().isBefore(Instant.now())) {
                return false;
            }
            
            Permission userPermission = Permission.fromValue(pageShare.getPermission());
            Permission required = Permission.fromValue(requiredPermission);
            
            switch (required) {
                case VIEW:
                    return userPermission.canView();
                case COMMENT:
                    return userPermission.canComment();
                case EDIT:
                    return userPermission.canEdit();
                case ADMIN:
                    return userPermission.canDelete();
                default:
                    return false;
            }
        }
        
        // Check public shares
        List<PageShare> publicShares = pageShareRepository.findByPageIdAndIsPublicTrueAndActiveTrue(pageId);
        for (PageShare publicShare : publicShares) {
            if (publicShare.getExpiresAt() == null || publicShare.getExpiresAt().isAfter(Instant.now())) {
                Permission userPermission = Permission.fromValue(publicShare.getPermission());
                Permission required = Permission.fromValue(requiredPermission);
                
                switch (required) {
                    case VIEW:
                        return userPermission.canView();
                    case COMMENT:
                        return userPermission.canComment();
                    case EDIT:
                        return userPermission.canEdit();
                    case ADMIN:
                        return userPermission.canDelete();
                    default:
                        return false;
                }
            }
        }
        
        return false;
    }

    public void revokeShare(String pageId, String sharedWithUserId, String revokedByUserId) {
        Optional<PageShare> share = pageShareRepository.findByPageIdAndSharedWithUserIdAndActiveTrue(pageId, sharedWithUserId);
        if (share.isPresent()) {
            PageShare pageShare = share.get();
            
            // Check if user can revoke (only owner or admin)
            if (!pageShare.getSharedByUserId().equals(revokedByUserId)) {
                throw new IllegalArgumentException("Not authorized to revoke this share");
            }
            
            pageShare.setActive(false);
            pageShare.setUpdatedAt(Instant.now());
            pageShareRepository.save(pageShare);
        }
    }

    public void revokePublicShare(String pageId, String revokedByUserId) {
        List<PageShare> publicShares = pageShareRepository.findByPageIdAndIsPublicTrueAndActiveTrue(pageId);
        for (PageShare share : publicShares) {
            if (share.getSharedByUserId().equals(revokedByUserId)) {
                share.setActive(false);
                share.setUpdatedAt(Instant.now());
                pageShareRepository.save(share);
            }
        }
    }

    public void updateSharePermission(String pageId, String sharedWithUserId, String newPermission, String updatedByUserId) {
        Optional<PageShare> share = pageShareRepository.findByPageIdAndSharedWithUserIdAndActiveTrue(pageId, sharedWithUserId);
        if (share.isPresent()) {
            PageShare pageShare = share.get();
            
            // Check if user can update (only owner or admin)
            if (!pageShare.getSharedByUserId().equals(updatedByUserId)) {
                throw new IllegalArgumentException("Not authorized to update this share");
            }
            
            // Validate permission
            Permission.valueOf(newPermission.toUpperCase());
            
            pageShare.setPermission(newPermission);
            pageShare.setUpdatedAt(Instant.now());
            pageShareRepository.save(pageShare);
        }
    }

    public List<PageShare> getExpiredShares() {
        return pageShareRepository.findExpiredShares(Instant.now());
    }

    public void cleanupExpiredShares() {
        List<PageShare> expiredShares = getExpiredShares();
        for (PageShare share : expiredShares) {
            share.setActive(false);
            share.setUpdatedAt(Instant.now());
            pageShareRepository.save(share);
        }
    }

    public void deleteAllSharesForPage(String pageId) {
        pageShareRepository.deleteByPageId(pageId);
    }

    public void deleteAllSharesByUser(String userId) {
        pageShareRepository.deleteBySharedByUserId(userId);
    }

    public void deleteAllSharesWithUser(String userId) {
        pageShareRepository.deleteBySharedWithUserId(userId);
    }

    private String generateShareLink() {
        return "share_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
} 