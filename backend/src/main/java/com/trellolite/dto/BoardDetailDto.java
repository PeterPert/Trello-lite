package com.trellolite.dto;

import com.trellolite.model.BoardList;
import com.trellolite.model.Card;
import java.util.List;

public class BoardDetailDto {
    private Long id;
    private String name;
    private List<ListWithCardsDto> lists;

    public BoardDetailDto() {}

    public BoardDetailDto(Long id, String name, List<ListWithCardsDto> lists) {
        this.id = id;
        this.name = name;
        this.lists = lists;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<ListWithCardsDto> getLists() { return lists; }
    public void setLists(List<ListWithCardsDto> lists) { this.lists = lists; }

    public static class ListWithCardsDto {
        private Long id;
        private String title;
        private Integer position;
        private List<Card> cards;

        public ListWithCardsDto() {}

        public ListWithCardsDto(BoardList list, List<Card> cards) {
            this.id = list.getId();
            this.title = list.getTitle();
            this.position = list.getPosition();
            this.cards = cards;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getPosition() { return position; }
        public void setPosition(Integer position) { this.position = position; }
        public List<Card> getCards() { return cards; }
        public void setCards(List<Card> cards) { this.cards = cards; }
    }
}
