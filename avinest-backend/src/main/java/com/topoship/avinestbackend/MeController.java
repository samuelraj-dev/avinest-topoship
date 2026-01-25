package com.topoship.avinestbackend;

import com.topoship.avinestbackend.auth.AuthenticatedUser;
import com.topoship.avinestbackend.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = {"api"})
public class MeController {

    private final UserService userService;

    public MeController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping(path = {"me"})
    public String me(HttpServletRequest req) {
        AuthenticatedUser user = (AuthenticatedUser) req.getAttribute("auth");

        return userService.getOneById(user.userId()).getUsername();
    }
}
