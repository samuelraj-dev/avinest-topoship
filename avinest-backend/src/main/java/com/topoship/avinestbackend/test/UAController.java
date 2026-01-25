package com.topoship.avinestbackend.test;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ua_parser.Client;
import ua_parser.Parser;

@RestController
@RequestMapping(path = {"api/test"})
public class UAController {

    @GetMapping(path = {"ua"})
    public Client getUA(HttpServletRequest req, HttpServletResponse res) {
        Parser uaParser = new Parser();
        Client c = uaParser.parse(req.getHeader("User-Agent"));
        return c;
    }
}
