package com.trellolite.dto;

public class MoveCardRequest {
    private Long targetListId;
    private Integer position;

    public Long getTargetListId() { return targetListId; }
    public void setTargetListId(Long targetListId) { this.targetListId = targetListId; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
