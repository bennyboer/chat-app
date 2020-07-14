package edu.hm.chat.controller.user;

import edu.hm.chat.persistence.dao.ResourceInfoRepository;
import edu.hm.chat.persistence.dao.UserDetailsRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.User;
import edu.hm.chat.persistence.model.UserDetails;
import edu.hm.chat.service.ResourceStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Controller delivering user details.
 */
@RestController
@RequestMapping("/api/user/details")
public class UserDetailsController {

    /**
     * Logger for the controller.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(UserDetailsController.class);

    /**
     * Repository dealing with user details storage.
     */
    private final UserDetailsRepository userDetailsRepository;

    /**
     * Repository dealing with user storage.
     */
    private final UserRepository userRepository;

    /**
     * Resource storage service.
     */
    private final ResourceStorageService resourceStorageService;

    /**
     * Resource info repository.
     */
    private final ResourceInfoRepository resourceInfoRepository;

    public UserDetailsController(
            UserDetailsRepository userDetailsRepository,
            UserRepository userRepository,
            ResourceStorageService resourceStorageService,
            ResourceInfoRepository resourceInfoRepository
    ) {
        this.userDetailsRepository = userDetailsRepository;
        this.userRepository = userRepository;
        this.resourceStorageService = resourceStorageService;
        this.resourceInfoRepository = resourceInfoRepository;
    }

    /**
     * Retrieve details for a single user.
     *
     * @param userId to fetch details for
     * @return the user details response
     */
    @PreAuthorize("hasAuthority('READ_USER_DETAILS')")
    @GetMapping("/{userId}")
    public ResponseEntity<UserDetails> get(@PathVariable Long userId) {
        return userDetailsRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Retrieve a batch of user details with one request.
     *
     * @param userIds ids of the users to fetch details for
     * @return the fetched details
     */
    @PreAuthorize("hasAuthority('READ_USER_DETAILS')")
    @PostMapping("/batch")
    public ResponseEntity<List<UserDetails>> getBatch(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(StreamSupport
                .stream(userDetailsRepository.findAllById(userIds).spliterator(), false)
                .collect(Collectors.toList()));
    }

    @PreAuthorize("hasAuthority('WRITE_USER_DETAILS')")
    @PostMapping
    public ResponseEntity<?> update(@RequestBody UserDetails details, Principal principal) {
        User authenticatedUser = userRepository.findByEmail(principal.getName());

        if (details.getUserId() != null && !details.getUserId().equals(authenticatedUser.getId())) {
            // Only the user itself is able to change their details
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("The currently authenticated user is not allowed to change another users details");
        }

        details.setUserId(authenticatedUser.getId());

        Optional<UserDetails> oldDetails = userDetailsRepository.findById(details.getUserId());
        if (oldDetails.isPresent()) {
            var old = oldDetails.get();

            if (old.getImageId() != null && !old.getImageId().equals(details.getImageId())) {
                var optOldInfo = resourceInfoRepository.findById(old.getImageId());
                if (optOldInfo.isPresent()) {
                    resourceInfoRepository.deleteById(old.getImageId()); // Remove old image from resource storage
                }

                try {
                    resourceStorageService.remove(old.getImageId());
                } catch (IOException e) {
                    LOGGER.error("Could not remove old user image", e);
                }
            }
        }

        // Make the image (if set) publicly available
        if (details.getImageId() != null && details.getImageId().length() > 0) {
            var optResourceInfo = resourceInfoRepository.findById(details.getImageId());
            if (optResourceInfo.isEmpty()) {
                details.setImageId(null);
            } else {
                var info = optResourceInfo.get();
                info.setPublic(true);
                resourceInfoRepository.save(info);
            }
        }

        return ResponseEntity.ok(userDetailsRepository.save(details));
    }

}
