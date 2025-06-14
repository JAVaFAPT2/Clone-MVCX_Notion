package com.clone.notion.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clone.notion.model.Page;
import com.clone.notion.service.PageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pages")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @GetMapping
    public List<Page> getAll() {
        return pageService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getById(@PathVariable String id) {
        Page page = pageService.findById(id);
        return page != null ? ResponseEntity.ok(page) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Page> create(@RequestBody Page page) {
        Page created = pageService.create(page);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Page> update(@PathVariable String id, @RequestBody Page page) {
        Page updated = pageService.update(id, page);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        pageService.delete(id);
        return ResponseEntity.noContent().build();
    }
} 