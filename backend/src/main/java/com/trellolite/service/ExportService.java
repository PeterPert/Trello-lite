package com.trellolite.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trellolite.dto.BoardDetailDto;
import com.trellolite.model.Card;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {
    private final BoardService boardService;
    private final ObjectMapper objectMapper;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    public ExportService(BoardService boardService, ObjectMapper objectMapper) {
        this.boardService = boardService;
        this.objectMapper = objectMapper;
    }

    public String exportHtml(Long boardId) {
        BoardDetailDto board = boardService.getBoardDetail(boardId);
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<title>").append(escape(board.getName())).append("</title>");
        html.append("<style>");
        html.append("body{font-family:Segoe UI,Arial,sans-serif;margin:24px;background:#f4f5f7;}");
        html.append("h1{color:#172b4d;} .list{background:#ebecf0;border-radius:8px;padding:12px;margin-bottom:16px;}");
        html.append(".list-title{font-weight:bold;margin-bottom:8px;} .card{background:#fff;border-radius:6px;padding:10px;margin:6px 0;box-shadow:0 1px 2px rgba(0,0,0,.1);}");
        html.append(".label{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:4px;color:#fff;}");
        html.append(".deadline{font-size:12px;color:#666;margin-top:4px;} .overdue{color:#eb5a46;font-weight:bold;}");
        html.append("</style></head><body>");
        html.append("<h1>").append(escape(board.getName())).append("</h1>");

        for (BoardDetailDto.ListWithCardsDto list : board.getLists()) {
            html.append("<div class='list'><div class='list-title'>").append(escape(list.getTitle())).append("</div>");
            for (Card card : list.getCards()) {
                html.append("<div class='card'>");
                html.append("<div><strong>").append(escape(card.getTitle())).append("</strong></div>");
                if (card.getDescription() != null && !card.getDescription().isBlank()) {
                    html.append("<div>").append(escape(card.getDescription())).append("</div>");
                }
                appendLabels(html, card);
                if (card.getDeadline() != null) {
                    boolean overdue = card.getDeadline().isBefore(java.time.LocalDateTime.now());
                    html.append("<div class='deadline").append(overdue ? " overdue" : "").append("'>");
                    html.append("Дедлайн: ").append(card.getDeadline().format(FMT));
                    if (overdue) html.append(" (просрочено)");
                    html.append("</div>");
                }
                html.append("</div>");
            }
            html.append("</div>");
        }
        html.append("</body></html>");
        return html.toString();
    }

    public byte[] exportPdf(Long boardId) {
        String html = exportHtml(boardId);
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка генерации PDF", e);
        }
    }

    private void appendLabels(StringBuilder html, Card card) {
        try {
            List<String> labels = objectMapper.readValue(
                    card.getLabels() != null ? card.getLabels() : "[]",
                    new TypeReference<List<String>>() {});
            for (String label : labels) {
                html.append("<span class='label' style='background:").append(labelColor(label)).append("'>")
                        .append(escape(label)).append("</span>");
            }
        } catch (Exception ignored) {}
    }

    private String labelColor(String label) {
        return switch (label.toLowerCase()) {
            case "red", "красный" -> "#eb5a46";
            case "green", "зелёный", "зеленый" -> "#61bd4f";
            case "blue", "синий" -> "#0079bf";
            case "yellow", "жёлтый", "желтый" -> "#f2d600";
            case "purple", "фиолетовый" -> "#c377e0";
            case "orange", "оранжевый" -> "#ff9f1a";
            default -> "#838c91";
        };
    }

    private String escape(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
