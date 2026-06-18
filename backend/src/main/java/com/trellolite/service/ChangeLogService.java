package com.trellolite.service;

import com.trellolite.model.ChangeLog;
import com.trellolite.repository.ChangeLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ChangeLogService {
    private final ChangeLogRepository changeLogRepository;

    public ChangeLogService(ChangeLogRepository changeLogRepository) {
        this.changeLogRepository = changeLogRepository;
    }

    public void log(String entityType, Long entityId, String action, String details) {
        ChangeLog log = new ChangeLog();
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setDetails(details);
        changeLogRepository.save(log);
    }
}
