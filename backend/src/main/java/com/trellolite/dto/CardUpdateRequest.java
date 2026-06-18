package com.trellolite.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CardUpdateRequest {
    private String title;
    private String description;
    private List<String> labels;
    private LocalDateTime deadline;
    private Boolean clearDeadline;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public Boolean getClearDeadline() { return clearDeadline; }
    public void setClearDeadline(Boolean clearDeadline) { this.clearDeadline = clearDeadline; }
}
