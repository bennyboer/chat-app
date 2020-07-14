package edu.hm.chat.controller;

import edu.hm.chat.constants.SecurityConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

@Controller
public class CustomErrorController implements ErrorController {

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            String requestedResource = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

            LOGGER.info(String.format("Handling error code %d which occurred when trying to access resource '%s'", statusCode, requestedResource));

            return "forward:/error/" + statusCode;
        }

        return "forward:/error";
    }

    @Override
    public String getErrorPath() {
        LOGGER.info("Getting error path!");
        return "/error";
    }

}
