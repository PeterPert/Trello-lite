package com.trellolite.repository;

import com.trellolite.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findAllByOrderByUpdatedAtDesc();
}
