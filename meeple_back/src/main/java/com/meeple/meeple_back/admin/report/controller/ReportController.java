package com.meeple.meeple_back.admin.report.controller;

import com.meeple.meeple_back.admin.report.service.ReportService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/report")
@AllArgsConstructor
public class ReportController {
    private final ReportService reportService;
}
