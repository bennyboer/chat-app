package edu.hm.chat.persistence.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.lang.Nullable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.Size;
import java.util.Objects;

/**
 * Details of a user.
 */
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDetails {

    /**
     * ID of the user the details belong to.
     */
    @Id
    @Column(unique = true, nullable = false)
    private Long userId;

    /**
     * Image ID of the users image.
     */
    @Nullable
    private String imageId;

    /**
     * Status of the user.
     */
    @Nullable
    @Size(max = 4096)
    private String status;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userID) {
        this.userId = userID;
    }

    @Nullable
    public String getImageId() {
        return imageId;
    }

    public void setImageId(@Nullable String imageID) {
        this.imageId = imageID;
    }

    @Nullable
    public String getStatus() {
        return status;
    }

    public void setStatus(@Nullable String status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        UserDetails that = (UserDetails) o;

        if (!Objects.equals(userId, that.userId)) return false;
        if (!Objects.equals(imageId, that.imageId)) return false;
        return Objects.equals(status, that.status);
    }

    @Override
    public int hashCode() {
        int result = userId != null ? userId.hashCode() : 0;
        result = 31 * result + (imageId != null ? imageId.hashCode() : 0);
        result = 31 * result + (status != null ? status.hashCode() : 0);
        return result;
    }

}
