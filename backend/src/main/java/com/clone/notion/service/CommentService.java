package com.clone.notion.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.clone.notion.model.Comment;
import com.clone.notion.repository.CommentRepository;
import com.clone.notion.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    
    // Regex pattern to find @mentions
    private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9_]+)");

    public List<Comment> getCommentsForPage(String pageId) {
        List<Comment> topLevelComments = commentRepository.findByPageIdAndParentCommentIdIsNullOrderByCreatedAtDesc(pageId);
        
        // Load replies for each comment
        for (Comment comment : topLevelComments) {
            comment.setReplies(commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId()));
        }
        
        return topLevelComments;
    }

    public List<Comment> getCommentsForBlock(String pageId, String blockId) {
        return commentRepository.findByPageIdAndBlockIdOrderByCreatedAtDesc(pageId, blockId);
    }

    public Comment createComment(String pageId, String userId, String username, String content, String blockId) {
        List<String> mentions = extractMentions(content);
        
        Comment comment = Comment.builder()
            .pageId(pageId)
            .userId(userId)
            .username(username)
            .content(content)
            .blockId(blockId)
            .mentions(mentions)
            .resolved(false)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .replies(new ArrayList<>())
            .build();
        
        return commentRepository.save(comment);
    }

    public Comment createReply(String parentCommentId, String userId, String username, String content) {
        Comment parentComment = commentRepository.findById(parentCommentId)
            .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
        
        List<String> mentions = extractMentions(content);
        
        Comment reply = Comment.builder()
            .pageId(parentComment.getPageId())
            .userId(userId)
            .username(username)
            .content(content)
            .blockId(parentComment.getBlockId())
            .parentCommentId(parentCommentId)
            .mentions(mentions)
            .resolved(false)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        
        return commentRepository.save(reply);
    }

    public Comment resolveComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        
        comment.setResolved(true);
        comment.setUpdatedAt(Instant.now());
        
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        
        // Check if user owns the comment
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User not authorized to delete this comment");
        }
        
        // Delete all replies first
        commentRepository.deleteByParentCommentId(commentId);
        
        // Delete the comment
        commentRepository.delete(comment);
    }

    public List<Comment> getMentionsForUser(String userId) {
        return commentRepository.findByMentionsContaining(userId);
    }

    public List<Comment> getUnresolvedComments(String pageId) {
        return commentRepository.findByPageIdAndResolvedFalseOrderByCreatedAtDesc(pageId);
    }

    public long getCommentCount(String pageId) {
        return commentRepository.countByPageId(pageId);
    }

    public void deleteCommentsForPage(String pageId) {
        commentRepository.deleteByPageId(pageId);
    }

    public void deleteCommentsForBlock(String pageId, String blockId) {
        commentRepository.deleteByPageIdAndBlockId(pageId, blockId);
    }

    /**
     * Extract @mentions from comment content
     */
    private List<String> extractMentions(String content) {
        List<String> mentions = new ArrayList<>();
        Matcher matcher = MENTION_PATTERN.matcher(content);
        
        while (matcher.find()) {
            String username = matcher.group(1);
            // Find user by username and add their ID to mentions
            userRepository.findByUsername(username).ifPresent(user -> {
                mentions.add(user.getId());
            });
        }
        
        return mentions;
    }

    /**
     * Validate if mentioned users exist
     */
    public boolean validateMentions(String content) {
        Matcher matcher = MENTION_PATTERN.matcher(content);
        
        while (matcher.find()) {
            String username = matcher.group(1);
            if (!userRepository.existsByUsername(username)) {
                return false;
            }
        }
        
        return true;
    }
} 