package edu.hm.chat.persistence.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.Date;
import java.util.Objects;
import java.util.Set;

/**
 * Info for a resource.
 */
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResourceInfo {

    /**
     * ID of the resource.
     */
    @Id
    @Column(unique = true, nullable = false)
    private String resourceId;

    /**
     * ID of the owner user.
     */
    @Column(nullable = false)
    private Long ownerId;

    /**
     * Whether the resource is publicly available.
     */
    @Column(nullable = false)
    private Boolean isPublic;

    /**
     * Set of users which are allowed to retrieve that resource.
     */
    @ManyToMany
    @JsonIgnore
    private Set<User> visibleFor;

    /**
     * Original name of the file which has been uploaded.
     */
    @Size(max = 1024)
    @Column(nullable = false)
    private String originalName;

    /**
     * Size of the resource.
     */
    @Column(nullable = false)
    private Long size;

    /**
     * Content type of the resource.
     */
    @Column(nullable = false)
    private String contentType;

    /**
     * Timestamp of then the resource has been created.
     */
    @Column(nullable = false)
    private Long timestamp;

    public ResourceInfo(String resourceId, User owner) {
        this.resourceId = resourceId;
        this.ownerId = owner.getId();
        this.visibleFor = Set.of(owner);
        this.timestamp = new Date().getTime();
    }

    public ResourceInfo() {
        // Default constructor
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceID) {
        this.resourceId = resourceID;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Boolean getPublic() {
        return isPublic;
    }

    public void setPublic(Boolean aPublic) {
        isPublic = aPublic;
    }

    public Set<User> getVisibleFor() {
        return visibleFor;
    }

    public void setVisibleFor(Set<User> visibleFor) {
        this.visibleFor = visibleFor;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ResourceInfo that = (ResourceInfo) o;

        if (!Objects.equals(resourceId, that.resourceId)) return false;
        if (!Objects.equals(ownerId, that.ownerId)) return false;
        if (!Objects.equals(isPublic, that.isPublic)) return false;
        if (!Objects.equals(visibleFor, that.visibleFor)) return false;
        if (!Objects.equals(originalName, that.originalName)) return false;
        if (!Objects.equals(size, that.size)) return false;
        return Objects.equals(contentType, that.contentType);
    }

    @Override
    public int hashCode() {
        int result = resourceId != null ? resourceId.hashCode() : 0;
        result = 31 * result + (ownerId != null ? ownerId.hashCode() : 0);
        result = 31 * result + (isPublic != null ? isPublic.hashCode() : 0);
        result = 31 * result + (visibleFor != null ? visibleFor.hashCode() : 0);
        result = 31 * result + (originalName != null ? originalName.hashCode() : 0);
        result = 31 * result + (size != null ? size.hashCode() : 0);
        result = 31 * result + (contentType != null ? contentType.hashCode() : 0);
        return result;
    }
}
