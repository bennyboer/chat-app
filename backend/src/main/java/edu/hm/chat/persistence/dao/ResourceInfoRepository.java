package edu.hm.chat.persistence.dao;

import edu.hm.chat.persistence.model.ResourceInfo;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Repository dealing with resource infos.
 */
public interface ResourceInfoRepository extends CrudRepository<ResourceInfo, String> {

    List<ResourceInfo> findByOwnerId(Long ownerID);

}
