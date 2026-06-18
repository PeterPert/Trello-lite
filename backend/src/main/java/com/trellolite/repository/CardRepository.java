package com.trellolite.repository;

import com.trellolite.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByListIdOrderByPositionAsc(Long listId);

    @Query(value = "SELECT c.* FROM cards c JOIN board_lists l ON c.list_id = l.id " +
           "WHERE l.board_id = :boardId AND (LOWER(c.title) LIKE '%' || LOWER(:query) || '%' " +
           "OR LOWER(c.description) LIKE '%' || LOWER(:query) || '%')", nativeQuery = true)
    List<Card> searchInBoard(@Param("boardId") Long boardId, @Param("query") String query);

    @Query(value = "SELECT c.* FROM cards c JOIN board_lists l ON c.list_id = l.id " +
           "WHERE c.deadline IS NOT NULL AND c.deadline BETWEEN :from AND :to", nativeQuery = true)
    List<Card> findCardsWithDeadlineBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
