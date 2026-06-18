package com.trellolite.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trellolite.dto.BoardDetailDto;
import com.trellolite.dto.CardUpdateRequest;
import com.trellolite.dto.MoveCardRequest;
import com.trellolite.model.Board;
import com.trellolite.model.BoardList;
import com.trellolite.model.Card;
import com.trellolite.repository.BoardListRepository;
import com.trellolite.repository.BoardRepository;
import com.trellolite.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final BoardListRepository boardListRepository;
    private final CardRepository cardRepository;
    private final ChangeLogService changeLogService;
    private final ObjectMapper objectMapper;

    public BoardService(BoardRepository boardRepository,
                        BoardListRepository boardListRepository,
                        CardRepository cardRepository,
                        ChangeLogService changeLogService,
                        ObjectMapper objectMapper) {
        this.boardRepository = boardRepository;
        this.boardListRepository = boardListRepository;
        this.cardRepository = cardRepository;
        this.changeLogService = changeLogService;
        this.objectMapper = objectMapper;
    }

    public List<Board> getAllBoards() {
        return boardRepository.findAllByOrderByUpdatedAtDesc();
    }

    public Board createBoard(String name) {
        Board board = new Board();
        board.setName(name.trim().isEmpty() ? "Новая доска" : name.trim());
        Board saved = boardRepository.save(board);
        changeLogService.log("BOARD", saved.getId(), "CREATE", "Создана доска: " + saved.getName());
        return saved;
    }

    public Board renameBoard(Long id, String name) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Доска не найдена"));
        String oldName = board.getName();
        board.setName(name.trim());
        Board saved = boardRepository.save(board);
        changeLogService.log("BOARD", id, "RENAME", oldName + " → " + saved.getName());
        return saved;
    }

    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Доска не найдена"));
        List<BoardList> lists = boardListRepository.findByBoardIdOrderByPositionAsc(id);
        for (BoardList list : lists) {
            cardRepository.deleteAll(cardRepository.findByListIdOrderByPositionAsc(list.getId()));
        }
        boardListRepository.deleteAll(lists);
        boardRepository.delete(board);
        changeLogService.log("BOARD", id, "DELETE", "Удалена доска: " + board.getName());
    }

    public BoardDetailDto getBoardDetail(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Доска не найдена"));
        List<BoardList> lists = boardListRepository.findByBoardIdOrderByPositionAsc(id);
        List<BoardDetailDto.ListWithCardsDto> listDtos = lists.stream()
                .map(list -> new BoardDetailDto.ListWithCardsDto(
                        list,
                        cardRepository.findByListIdOrderByPositionAsc(list.getId())))
                .collect(Collectors.toList());
        return new BoardDetailDto(board.getId(), board.getName(), listDtos);
    }

    public BoardList createList(Long boardId, String title) {
        boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Доска не найдена"));
        BoardList list = new BoardList();
        list.setBoardId(boardId);
        list.setTitle(title.trim().isEmpty() ? "Новый список" : title.trim());
        list.setPosition((int) boardListRepository.countByBoardId(boardId));
        BoardList saved = boardListRepository.save(list);
        changeLogService.log("LIST", saved.getId(), "CREATE", "Создан список: " + saved.getTitle());
        return saved;
    }

    public BoardList renameList(Long listId, String title) {
        BoardList list = boardListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Список не найден"));
        String oldTitle = list.getTitle();
        list.setTitle(title.trim());
        BoardList saved = boardListRepository.save(list);
        changeLogService.log("LIST", listId, "RENAME", oldTitle + " → " + saved.getTitle());
        return saved;
    }

    @Transactional
    public void deleteList(Long listId) {
        BoardList list = boardListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Список не найден"));
        cardRepository.deleteAll(cardRepository.findByListIdOrderByPositionAsc(listId));
        boardListRepository.delete(list);
        changeLogService.log("LIST", listId, "DELETE", "Удалён список: " + list.getTitle());
    }

    @Transactional
    public void reorderLists(Long boardId, List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Long listId = orderedIds.get(i);
            BoardList list = boardListRepository.findById(listId)
                    .orElseThrow(() -> new RuntimeException("Список не найден"));
            if (!list.getBoardId().equals(boardId)) {
                throw new RuntimeException("Список не принадлежит доске");
            }
            list.setPosition(i);
            boardListRepository.save(list);
        }
        changeLogService.log("BOARD", boardId, "REORDER_LISTS", "Изменён порядок списков");
    }

    public Card createCard(Long listId, String title) {
        boardListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Список не найден"));
        Card card = new Card();
        card.setListId(listId);
        card.setTitle(title.trim().isEmpty() ? "Новая карточка" : title.trim());
        card.setDescription("");
        card.setLabels("[]");
        card.setPosition(cardRepository.findByListIdOrderByPositionAsc(listId).size());
        Card saved = cardRepository.save(card);
        changeLogService.log("CARD", saved.getId(), "CREATE", "Создана карточка: " + saved.getTitle());
        return saved;
    }

    public Card updateCard(Long cardId, CardUpdateRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Карточка не найдена"));
        StringBuilder details = new StringBuilder();
        if (request.getTitle() != null) {
            details.append("title: ").append(card.getTitle()).append(" → ").append(request.getTitle()).append("; ");
            card.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            card.setDescription(request.getDescription());
            details.append("description updated; ");
        }
        if (request.getLabels() != null) {
            try {
                card.setLabels(objectMapper.writeValueAsString(request.getLabels()));
                details.append("labels updated; ");
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Ошибка сериализации меток");
            }
        }
        if (Boolean.TRUE.equals(request.getClearDeadline())) {
            card.setDeadline(null);
            details.append("deadline cleared; ");
        } else if (request.getDeadline() != null) {
            card.setDeadline(request.getDeadline());
            details.append("deadline updated; ");
        }
        Card saved = cardRepository.save(card);
        changeLogService.log("CARD", cardId, "UPDATE", details.toString());
        return saved;
    }

    @Transactional
    public void deleteCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Карточка не найдена"));
        cardRepository.delete(card);
        changeLogService.log("CARD", cardId, "DELETE", "Удалена карточка: " + card.getTitle());
    }

    @Transactional
    public Card moveCard(Long cardId, MoveCardRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Карточка не найдена"));
        Long oldListId = card.getListId();
        Long targetListId = request.getTargetListId();
        boardListRepository.findById(targetListId)
                .orElseThrow(() -> new RuntimeException("Целевой список не найден"));

        if (!oldListId.equals(targetListId)) {
            List<Card> oldListCards = new ArrayList<>(cardRepository.findByListIdOrderByPositionAsc(oldListId));
            oldListCards.removeIf(c -> c.getId().equals(cardId));
            for (int i = 0; i < oldListCards.size(); i++) {
                oldListCards.get(i).setPosition(i);
                cardRepository.save(oldListCards.get(i));
            }
            card.setListId(targetListId);
        }

        List<Card> targetCards = new ArrayList<>(cardRepository.findByListIdOrderByPositionAsc(targetListId));
        targetCards.removeIf(c -> c.getId().equals(cardId));
        int pos = Math.min(Math.max(request.getPosition(), 0), targetCards.size());
        targetCards.add(pos, card);
        for (int i = 0; i < targetCards.size(); i++) {
            targetCards.get(i).setPosition(i);
            cardRepository.save(targetCards.get(i));
        }

        changeLogService.log("CARD", cardId, "MOVE",
                "Перемещена карточка в список " + targetListId + " на позицию " + pos);
        return cardRepository.findById(cardId).orElseThrow();
    }

    public List<Card> searchCards(Long boardId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return cardRepository.searchInBoard(boardId, query.trim());
    }
}
