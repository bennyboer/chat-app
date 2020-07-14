package edu.hm.chat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration for the resource upload.
 */
@Component
@ConfigurationProperties(prefix = "edu.hm.chat.res")
public class ResourceUploadConfig {

    /**
     * Path to upload resources to.
     */
    private String uploadTarget;

    /**
     * Maximum amount of files per user.
     */
    private int maxFilesPerUser;

    public String getUploadTarget() {
        return uploadTarget;
    }

    public void setUploadTarget(String uploadTarget) {
        this.uploadTarget = uploadTarget;
    }

    public int getMaxFilesPerUser() {
        return maxFilesPerUser;
    }

    public void setMaxFilesPerUser(int maxFilesPerUser) {
        this.maxFilesPerUser = maxFilesPerUser;
    }

}
