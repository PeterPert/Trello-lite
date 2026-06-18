package com.trellolite.service;

import com.trellolite.dto.DeadlineNotificationDto;
import com.trellolite.model.Board;
import com.trellolite.model.BoardList;
import com.trellolite.model.Card;
import com.trellolite.repository.BoardListRepository;
import com.trellolite.repository.BoardRepository;
import com.trellolite.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {
    private final CardRepository cardRepository;
    private final BoardListRepository boardListRepository;
    private final BoardRepository boardRepository;

    public NotificationService(CardRepository cardRepository,
                               BoardListRepository boardListRepository,
                               BoardRepository boardRepository) {
        this.cardRepository = cardRepository;
        this.boardListRepository = boardListRepository;
        this.boardRepository = boardRepository;
    }

    public List<DeadlineNotificationDto> getUpcomingDeadlines(int hoursAhead) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime until = now.plusHours(hoursAhead);
        List<Card> cards = cardRepository.findCardsWithDeadlineBetween(now.minusDays(1), until);
        List<DeadlineNotificationDto> result = new ArrayList<>();

        for (Card card : cards) {
            BoardList list = boardListRepository.findById(card.getListId()).orElse(null);
            if (list == null) continue;
            Board board = boardRepository.findById(list.getBoardId()).orElse(null);
            if (board == null) continue;
            result.add(new DeadlineNotificationDto(
                    card.getId(), card.getTitle(), board.getId(), board.getName(), card.getDeadline()));
        }
        return result;
    }
}
