package com.clone.notion.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.UUID;

@Component
public class ApiDebugFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(ApiDebugFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Generate unique request ID
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        // Wrap request and response to cache their content
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
        
        long startTime = System.currentTimeMillis();
        
        // Log request details before processing
        logger.info("[{}] 🔼 API REQUEST: {} {}", requestId, request.getMethod(), request.getRequestURI());
        logger.debug("[{}] Request headers: {}", requestId, getHeadersAsString(request));
        
        try {
            // Proceed with the request
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            // Calculate request duration
            long duration = System.currentTimeMillis() - startTime;
            
            // Log request body after processing (so it's fully read)
            String requestBody = getRequestBody(requestWrapper);
            if (requestBody != null && !requestBody.isEmpty()) {
                logger.debug("[{}] Request body: {}", requestId, requestBody);
            }
            
            // Log response details
            int status = responseWrapper.getStatus();
            String statusSymbol = status >= 400 ? "❌" : "✅";
            logger.info("[{}] {} API RESPONSE: {} {} - {} ({} ms)", 
                    requestId, statusSymbol, request.getMethod(), request.getRequestURI(), status, duration);
            
            // Log response body
            String responseBody = getResponseBody(responseWrapper);
            if (responseBody != null && !responseBody.isEmpty() && responseBody.length() < 1000) {
                logger.debug("[{}] Response body: {}", requestId, responseBody);
            } else if (responseBody != null && !responseBody.isEmpty()) {
                logger.debug("[{}] Response body: (large response, length: {} chars)", requestId, responseBody.length());
            }
            
            // Don't forget to copy content to the original response
            responseWrapper.copyBodyToResponse();
        }
    }

    private String getHeadersAsString(HttpServletRequest request) {
        StringBuilder headers = new StringBuilder();
        request.getHeaderNames().asIterator().forEachRemaining(headerName -> {
            headers.append(headerName).append("=").append(request.getHeader(headerName)).append(", ");
        });
        return headers.toString();
    }

    private String getRequestBody(ContentCachingRequestWrapper request) {
        try {
            byte[] content = request.getContentAsByteArray();
            if (content.length > 0) {
                return new String(content, request.getCharacterEncoding());
            }
        } catch (UnsupportedEncodingException e) {
            logger.error("Could not read request body", e);
        }
        return null;
    }

    private String getResponseBody(ContentCachingResponseWrapper response) {
        try {
            byte[] content = response.getContentAsByteArray();
            if (content.length > 0) {
                return new String(content, response.getCharacterEncoding());
            }
        } catch (UnsupportedEncodingException e) {
            logger.error("Could not read response body", e);
        }
        return null;
    }
} 