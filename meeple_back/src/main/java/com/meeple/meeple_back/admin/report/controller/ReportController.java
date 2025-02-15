package com.meeple.meeple_back.admin.report.controller;

import com.meeple.meeple_back.admin.report.model.ReportReason;
import com.meeple.meeple_back.admin.report.model.request.RequestCreateReport;
import com.meeple.meeple_back.admin.report.model.request.RequestProcessReport;
import com.meeple.meeple_back.admin.report.model.request.RequestUpdateProcess;
import com.meeple.meeple_back.admin.report.model.response.*;
import com.meeple.meeple_back.admin.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;

import java.util.List;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/report")
@AllArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @DeleteMapping("/delete-user")
    public ResponseEntity<ResponseDeleteUser> deleteUser(
            @RequestParam long userId
    ) {
        ResponseDeleteUser response = reportService.deleteUser(userId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "신고 등록", description = "신고를 등록합니다.")
    @PostMapping
    public ResponseEntity<ResponseCreateReport> createReport(
            @RequestPart("reportDocument") MultipartFile reportDocument,
            @RequestPart("reportReason") ReportReason reportReason,
            @RequestPart("reportTitle") String reportTitle,
            @RequestPart("reportContent") String reportContent,
            @RequestPart("userId") long userId,
            @RequestPart("userId") long reporterId
    ) {
        ResponseCreateReport response = reportService.createReport(
                reportDocument, reportReason, reportTitle, reportContent,
                userId, reporterId
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "신고 목록 조회", description = "신고 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<ResponseReportList>> findReportList() {
        List<ResponseReportList> response = reportService.findReportList();

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(summary = "신고 단일 조회", description = "신고 상세 정보를 조회합니다.")
    @GetMapping("/{reportId}")
    public ResponseEntity<ResponseReport> findReport(
            @PathVariable int reportId
    ) {
        ResponseReport response = reportService.findReport(reportId);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(summary = "신고 처리", description = "신고를 처리합니다.")
    @PostMapping("/process-report")
    public ResponseEntity<ResponseProcessReport> processReport(
            @RequestBody RequestProcessReport request
    ) {
        ResponseProcessReport response = reportService.processReport(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PutMapping("/update-process")
    public ResponseEntity<ResponseUpdateProcess> updateProcess(
            @RequestBody RequestUpdateProcess request
    ) {
        ResponseUpdateProcess response = reportService.updateProcess(request);

        return ResponseEntity.ok(response);
    }


}
