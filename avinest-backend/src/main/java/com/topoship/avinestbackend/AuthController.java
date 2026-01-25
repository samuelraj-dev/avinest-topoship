package com.topoship.avinestbackend;

import com.topoship.avinestbackend.auth.dto.RefreshRequest;
import com.topoship.avinestbackend.auth.service.AuthService;
import com.topoship.avinestbackend.dto.LoginRequest;
import com.topoship.avinestbackend.dto.LoginResponse;
import com.topoship.avinestbackend.dto.TokenResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        LoginResponse response = authService.login(request, httpServletRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@RequestBody RefreshRequest req) {
        return authService.refresh(req.refreshToken());
    }

}
