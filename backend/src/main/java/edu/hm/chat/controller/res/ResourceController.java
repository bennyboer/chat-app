package edu.hm.chat.controller.res;

import edu.hm.chat.config.ResourceUploadConfig;
import edu.hm.chat.persistence.dao.ResourceInfoRepository;
import edu.hm.chat.persistence.dao.UserRepository;
import edu.hm.chat.persistence.model.ResourceInfo;
import edu.hm.chat.persistence.model.Role;
import edu.hm.chat.persistence.model.User;
import edu.hm.chat.service.ResourceStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

/**
 * Controller dealing with the upload and retrieval of binary resources.
 */
@RestController
@RequestMapping("/api/resource")
public class ResourceController {

    /**
     * Logger for the controller.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(ResourceController.class);

    /**
     * Service used to store and retrieve resources.
     */
    private final ResourceStorageService resourceStorageService;

    /**
     * Repository dealing with resource info.
     */
    private final ResourceInfoRepository resourceInfoRepository;

    /**
     * Repository dealing with users.
     */
    private final UserRepository userRepository;

    /**
     * Configuration for the upload.
     */
    private final ResourceUploadConfig config;

    public ResourceController(
            ResourceStorageService resourceStorageService,
            ResourceInfoRepository resourceInfoRepository,
            UserRepository userRepository,
            ResourceUploadConfig config
    ) {
        this.resourceStorageService = resourceStorageService;
        this.resourceInfoRepository = resourceInfoRepository;
        this.userRepository = userRepository;
        this.config = config;
    }

    /**
     * Get infos of all available resources (for the asking user).
     */
    @PreAuthorize("hasAuthority('READ_RESOURCE_INFO')")
    @GetMapping
    public ResponseEntity<Iterable<ResourceInfo>> getAll(Principal principal) {
        User authenticatedUser = userRepository.findByEmail(principal.getName());

        boolean isAdmin = authenticatedUser.getRoles().stream().map(Role::getName).anyMatch((rn) -> rn.equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(resourceInfoRepository.findAll());
        } else {
            return ResponseEntity.ok(resourceInfoRepository.findByOwnerId(authenticatedUser.getId()));
        }
    }

    /**
     * Get infos of all available resources for the passed user.
     */
    @PreAuthorize("hasAuthority('READ_RESOURCE_INFO')")
    @GetMapping("/for/{userId}")
    public ResponseEntity<Iterable<ResourceInfo>> getForUser(@PathVariable Long userId, Principal principal) {
        User authenticatedUser = userRepository.findByEmail(principal.getName());

        boolean isAdmin = authenticatedUser.getRoles().stream().map(Role::getName).anyMatch((rn) -> rn.equals("ROLE_ADMIN"));
        if (!isAdmin) {
            if (!userId.equals(authenticatedUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(resourceInfoRepository.findByOwnerId(authenticatedUser.getId()));
    }

    /**
     * Upload the passed file
     *
     * @param file      to upload
     * @param principal who is initiating the request
     * @return response
     */
    @PreAuthorize("hasAuthority('UPLOAD_FILE')")
    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file, Principal principal) {
        User authenticatedUser = userRepository.findByEmail(principal.getName());

        boolean isAdmin = authenticatedUser.getRoles().stream().map(Role::getName).anyMatch((rn) -> rn.equals("ROLE_ADMIN"));
        if (!isAdmin) {
            // Check whether the user is allowed to upload another file
            int maxFileCount = config.getMaxFilesPerUser();

            List<ResourceInfo> resourceInfos = resourceInfoRepository.findByOwnerId(authenticatedUser.getId());
            if (resourceInfos.size() >= maxFileCount) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User exceeded maximum file count for uploads");
            }
        }

        try {
            String contentType = file.getContentType();
            long size = file.getSize();
            String originalName = file.getOriginalFilename();

            String fileName = resourceStorageService.store(file);

            ResourceInfo info = new ResourceInfo(fileName, authenticatedUser);
            info.setContentType(contentType);
            info.setOriginalName(originalName);
            info.setSize(size);
            info.setPublic(false);

            resourceInfoRepository.save(info);

            return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/resource/{id}")
                    .buildAndExpand(fileName).toUri())
                    .build();
        } catch (IOException e) {
            LOGGER.error("Could not upload file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload file");
        }
    }

    /**
     * Download a resource.
     *
     * @param id of the resource
     * @return the file to download
     */
    @PreAuthorize("hasAuthority('DOWNLOAD_FILE')")
    @GetMapping("/{id}")
    public ResponseEntity<?> download(@PathVariable String id, Principal principal) {
        // Check if resource exists.
        Optional<ResourceInfo> resourceInfo = resourceInfoRepository.findById(id);
        if (resourceInfo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ResourceInfo info = resourceInfo.get();

        // Check if user has permission to download the resource.
        if (!info.getPublic()) {
            User authenticatedUser = userRepository.findByEmail(principal.getName());
            if (!info.getVisibleFor().contains(authenticatedUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("The requesting user is not allowed to see the requested resource");
            }
        }

        try {
            Resource resource = resourceStorageService.load(id);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(info.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException e) {
            LOGGER.error("Could not load file", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Remove a resource.
     *
     * @param id of the resource to remove
     * @return response
     */
    @PreAuthorize("hasAuthority('UPLOAD_FILE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> remove(@PathVariable String id, Principal principal) {
        User authenticatedUser = userRepository.findByEmail(principal.getName());

        // Check if resource exists
        Optional<ResourceInfo> resourceInfo = resourceInfoRepository.findById(id);
        if (resourceInfo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ResourceInfo info = resourceInfo.get();

        boolean isAdmin = authenticatedUser.getRoles().stream().map(Role::getName).anyMatch((rn) -> rn.equals("ROLE_ADMIN"));
        if (!isAdmin) {
            // Check if user is owner of resource to remove
            if (!info.getOwnerId().equals(authenticatedUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't own that resource, thus you cannot remove it");
            }
        }

        try {
            resourceStorageService.remove(id);
            resourceInfoRepository.deleteById(id);

            return ResponseEntity.ok().build();
        } catch (IOException e) {
            LOGGER.error("Could not remove resource file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not remove resource");
        }
    }

}
