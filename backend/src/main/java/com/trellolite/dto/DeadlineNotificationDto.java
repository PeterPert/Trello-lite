package com.trellolite.dto;

import java.time.LocalDateTime;

public class DeadlineNotificationDto {
    private Long cardId;
    private String cardTitle;
    private Long boardId;
    private String boardName;
    private LocalDateTime deadline;

    public DeadlineNotificationDto() {}

    public DeadlineNotificationDto(Long cardId, String cardTitle, Long boardId, String boardName, LocalDateTime deadline) {
        this.cardId = cardId;
        this.cardTitle = cardTitle;
        this.boardId = boardId;
        this.boardName = boardName;
        this.deadline = deadline;
    }

    public Long getCardId() { return cardId; }
    public void setCardId(Long cardId) { this.cardId = cardId; }
    public String getCardTitle() { return cardTitle; }
    public void setCardTitle(String cardTitle) { this.cardTitle = cardTitle; }
    public Long getBoardId() { return boardId; }
    public void setBoardId(Long boardId) { this.boardId = boardId; }
    public String getBoardName() { return boardName; }
    public void setBoardName(String boardName) { this.boardName = boardName; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
}
