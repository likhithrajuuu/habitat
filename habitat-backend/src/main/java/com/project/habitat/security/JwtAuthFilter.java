package com.project.habitat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth",
            "/api/oauth2",
            "/login",
            "/movies/**",
            "/genres",
            "/format",
            "/language"
    );

    public JwtAuthFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        log.info("JwtAuthFilter: Processing request for URI: {}", path);

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            log.debug("JwtAuthFilter: Bearer token found");

            try {
                if (jwtUtil.validate(token)) {
                    String username = jwtUtil.extractUsername(token);
                    log.debug("JwtAuthFilter: Token valid for user: {}", username);

                    UserDetails userDetails =
                            userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    auth.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(auth);

                    log.info("JwtAuthFilter: Authentication set in SecurityContext for user: {}", username);
                } else {
                    log.warn("JwtAuthFilter: Token validation failed");
                }
            } catch (Exception e) {
                log.error("JwtAuthFilter: JWT processing error: {}", e.getMessage());
            }
        } else {
            log.debug("JwtAuthFilter: No valid Authorization header found for path: {}", path);
        }

        filterChain.doFilter(request, response);
    }
}