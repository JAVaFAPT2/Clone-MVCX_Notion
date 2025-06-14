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

    public List<Page> findAll() {
        return pageRepository.findAll();
    }

    public Page findById(String id) {
        return pageRepository.findById(id).orElse(null);
    }

    public Page create(Page page) {
        page.setCreatedAt(Instant.now());
        page.setUpdatedAt(Instant.now());
        return pageRepository.save(page);
    }

    public Page update(String id, Page updated) {
        return pageRepository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setBlocks(updated.getBlocks());
            existing.setUpdatedAt(Instant.now());
            return pageRepository.save(existing);
        }).orElse(null);
    }

    public void delete(String id) {
        pageRepository.deleteById(id);
    }
} 