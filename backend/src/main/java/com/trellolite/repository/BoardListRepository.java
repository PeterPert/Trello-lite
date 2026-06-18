package com.trellolite.repository;

import com.trellolite.model.BoardList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoardListRepository extends JpaRepository<BoardList, Long> {
    List<BoardList> findByBoardIdOrderByPositionAsc(Long boardId);
    long countByBoardId(Long boardId);
}
