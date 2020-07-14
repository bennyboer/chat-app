package edu.hm.chat.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ViewController {

    /**
     * Redirect angular routes to the angular application.
     */
    @RequestMapping({
            "/login",
            "/signup",
            "/profile",
            "/chat/**",
            "/admin/**",
            "/error/**"
    })
    public String index() {
        return "forward:/index.html";
    }

}
