package com.trellolite.controller;

import com.trellolite.dto.BoardDetailDto;
import com.trellolite.dto.CardUpdateRequest;
import com.trellolite.dto.MoveCardRequest;
import com.trellolite.dto.ReorderRequest;
import com.trellolite.model.Board;
import com.trellolite.model.BoardList;
import com.trellolite.model.Card;
import com.trellolite.model.ChangeLog;
import com.trellolite.repository.ChangeLogRepository;
import com.trellolite.service.BoardService;
import com.trellolite.service.ExportService;
import com.trellolite.service.NotificationService;
import com.trellolite.dto.DeadlineNotificationDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final BoardService boardService;
    private final ExportService exportService;
    private final NotificationService notificationService;
    private final ChangeLogRepository changeLogRepository;

    public ApiController(BoardService boardService,
                         ExportService exportService,
                         NotificationService notificationService,
                         ChangeLogRepository changeLogRepository) {
        this.boardService = boardService;
        this.exportService = exportService;
        this.notificationService = notificationService;
        this.changeLogRepository = changeLogRepository;
    }

    @GetMapping("/boards")
    public List<Board> getAllBoards() {
        return boardService.getAllBoards();
    }

    @PostMapping("/boards")
    public Board createBoard(@RequestBody Map<String, String> body) {
        return boardService.createBoard(body.getOrDefault("name", "Новая доска"));
    }

    @PutMapping("/boards/{id}")
    public Board renameBoard(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return boardService.renameBoard(id, body.get("name"));
    }

    @DeleteMapping("/boards/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/boards/{id}")
    public BoardDetailDto getBoard(@PathVariable Long id) {
        return boardService.getBoardDetail(id);
    }

    @PostMapping("/boards/{boardId}/lists")
    public BoardList createList(@PathVariable Long boardId, @RequestBody Map<String, String> body) {
        return boardService.createList(boardId, body.getOrDefault("title", "Новый список"));
    }

    @PutMapping("/lists/{id}")
    public BoardList renameList(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return boardService.renameList(id, body.get("title"));
    }

    @DeleteMapping("/lists/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        boardService.deleteList(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/boards/{boardId}/lists/reorder")
    public ResponseEntity<Void> reorderLists(@PathVariable Long boardId, @RequestBody ReorderRequest request) {
        boardService.reorderLists(boardId, request.getOrderedIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lists/{listId}/cards")
    public Card createCard(@PathVariable Long listId, @RequestBody Map<String, String> body) {
        return boardService.createCard(listId, body.getOrDefault("title", "Новая карточка"));
    }

    @PutMapping("/cards/{id}")
    public Card updateCard(@PathVariable Long id, @RequestBody CardUpdateRequest request) {
        return boardService.updateCard(id, request);
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        boardService.deleteCard(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/cards/{id}/move")
    public Card moveCard(@PathVariable Long id, @RequestBody MoveCardRequest request) {
        return boardService.moveCard(id, request);
    }

    @GetMapping("/boards/{boardId}/search")
    public List<Card> search(@PathVariable Long boardId, @RequestParam String q) {
        return boardService.searchCards(boardId, q);
    }

    @GetMapping("/history")
    public List<ChangeLog> getHistory() {
        return changeLogRepository.findTop100ByOrderByTimestampDesc();
    }

    @GetMapping("/history/{entityType}/{entityId}")
    public List<ChangeLog> getEntityHistory(@PathVariable String entityType, @PathVariable Long entityId) {
        return changeLogRepository.findTop50ByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    @GetMapping("/boards/{id}/export/html")
    public ResponseEntity<String> exportHtml(@PathVariable Long id) {
        String html = exportService.exportHtml(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=board-" + id + ".html")
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    @GetMapping("/boards/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdf = exportService.exportPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=board-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/notifications/deadlines")
    public List<DeadlineNotificationDto> getDeadlineNotifications(
            @RequestParam(defaultValue = "24") int hours) {
        return notificationService.getUpcomingDeadlines(hours);
    }
}
