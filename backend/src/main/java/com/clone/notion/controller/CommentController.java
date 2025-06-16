package com.clone.notion.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Comment;
import com.clone.notion.service.CommentService;
import com.clone.notion.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    private UserDetailsImpl getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @GetMapping("/page/{pageId}")
    public ResponseEntity<List<Comment>> getCommentsForPage(@PathVariable String pageId) {
        try {
            List<Comment> comments = commentService.getCommentsForPage(pageId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page/{pageId}/block/{blockId}")
    public ResponseEntity<List<Comment>> getCommentsForBlock(
            @PathVariable String pageId, 
            @PathVariable String blockId) {
        try {
            List<Comment> comments = commentService.getCommentsForBlock(pageId, blockId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/page/{pageId}")
    public ResponseEntity<Comment> createComment(
            @PathVariable String pageId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = getAuthenticatedUser().getId();
            String username = getAuthenticatedUser().getUsername();
            String content = request.get("content");
            String blockId = request.get("blockId");

            // Validate mentions
            if (!commentService.validateMentions(content)) {
                return ResponseEntity.badRequest().build();
            }

            Comment comment = commentService.createComment(pageId, userId, username, content, blockId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<Comment> createReply(
            @PathVariable String commentId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = getAuthenticatedUser().getId();
            String username = getAuthenticatedUser().getUsername();
            String content = request.get("content");

            // Validate mentions
            if (!commentService.validateMentions(content)) {
                return ResponseEntity.badRequest().build();
            }

            Comment reply = commentService.createReply(commentId, userId, username, content);
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{commentId}/resolve")
    public ResponseEntity<Comment> resolveComment(@PathVariable String commentId) {
        try {
            String userId = getAuthenticatedUser().getId();
            Comment comment = commentService.resolveComment(commentId, userId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        try {
            String userId = getAuthenticatedUser().getId();
            commentService.deleteComment(commentId, userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/mentions")
    public ResponseEntity<List<Comment>> getMentionsForUser() {
        try {
            String userId = getAuthenticatedUser().getId();
            List<Comment> mentions = commentService.getMentionsForUser(userId);
            return ResponseEntity.ok(mentions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page/{pageId}/unresolved")
    public ResponseEntity<List<Comment>> getUnresolvedComments(@PathVariable String pageId) {
        try {
            List<Comment> comments = commentService.getUnresolvedComments(pageId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page/{pageId}/count")
    public ResponseEntity<Map<String, Long>> getCommentCount(@PathVariable String pageId) {
        try {
            long count = commentService.getCommentCount(pageId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/validate-mentions")
    public ResponseEntity<Map<String, Boolean>> validateMentions(@RequestBody Map<String, String> request) {
        try {
            String content = request.get("content");
            boolean isValid = commentService.validateMentions(content);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 