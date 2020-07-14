package edu.hm.chat.service;

import edu.hm.chat.config.ResourceUploadConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service handing resource storage.
 */
@Service
public class ResourceStorageService {

    /**
     * Logger for the service.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(ResourceStorageService.class);

    /**
     * Configuration for the upload.
     */
    private final ResourceUploadConfig config;

    public ResourceStorageService(ResourceUploadConfig config) {
        this.config = config;

        initializeUploadTarget();
    }

    /**
     * Initialize the upload target.
     */
    private void initializeUploadTarget() {
        try {
            Files.createDirectories(getUploadTarget());
        } catch (Exception e) {
            LOGGER.error("An error occurred when trying to create the folder to upload resources to", e);
        }
    }

    /**
     * Get the upload target path.
     *
     * @return upload target path
     */
    private Path getUploadTarget() {
        return Paths.get(config.getUploadTarget()).toAbsolutePath().normalize();
    }

    /**
     * Store the passed file.
     *
     * @param file to store
     * @return the new location of the file
     */
    public String store(MultipartFile file) throws IOException {
        UUID uuid = UUID.randomUUID(); // Generate UUID for the file to upload
        String fileName = uuid.toString();

        Path targetLocation = getUploadTarget().resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    /**
     * Load a resource with the passed file name.
     *
     * @param fileName to get resource for
     * @return the loaded resource
     */
    public Resource load(String fileName) throws IOException {
        try {
            Path path = getUploadTarget().resolve(fileName).normalize();

            Resource resource = new UrlResource(path.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new IOException("File with the passed file name does not exist");
            }
        } catch (MalformedURLException ex) {
            throw new IOException(ex);
        }
    }

    /**
     * Remove the resource with the passed file name.
     *
     * @param fileName to remove file for
     */
    public void remove(String fileName) throws IOException {
        Path path = getUploadTarget().resolve(fileName).normalize();
        Files.deleteIfExists(path);
    }

}
