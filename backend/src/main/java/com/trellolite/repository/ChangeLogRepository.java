package com.trellolite.repository;

import com.trellolite.model.ChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChangeLogRepository extends JpaRepository<ChangeLog, Long> {
    List<ChangeLog> findTop100ByOrderByTimestampDesc();
    List<ChangeLog> findTop50ByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, Long entityId);
}
