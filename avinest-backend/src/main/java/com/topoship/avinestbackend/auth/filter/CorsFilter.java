package com.topoship.avinestbackend.auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class CorsFilter extends OncePerRequestFilter {

    // @Value("${app.allowed-origins}")
    // private String allowedOrigins;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // String origin = request.getHeader("Origin");

        // boolean allowed = origin != null && Arrays.stream(allowedOrigins.split(","))
        //         .map(String::trim)
        //         .anyMatch(o -> o.equals(origin));

        // if (origin == null || allowed) {
            response.setHeader("Access-Control-Allow-Origin", "https://avinest.topoship.com");
            response.setHeader("Access-Control-Allow-Methods", "*");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Allow-Credentials", "true");
        // }

        // System.out.println("Origin: [" + origin + "]");
        // System.out.println("AllowedOrigins: [" + allowedOrigins + "]");

        // System.out.println("Allowed: " + allowed);

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        filterChain.doFilter(request, response);
    }
}