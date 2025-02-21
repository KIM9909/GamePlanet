package com.meeple.meeple_back.admin.report.service;

import com.meeple.meeple_back.admin.report.model.ReportReason;
import com.meeple.meeple_back.admin.report.model.request.RequestCreateReport;
import com.meeple.meeple_back.admin.report.model.request.RequestProcessReport;
import com.meeple.meeple_back.admin.report.model.request.RequestUpdateProcess;
import com.meeple.meeple_back.admin.report.model.response.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReportService {

    List<ResponseReportList> findReportList();

    ResponseReport findReport(int reportId);

    ResponseProcessReport processReport(RequestProcessReport request);

    ResponseUpdateProcess updateProcess(RequestUpdateProcess request);

    ResponseDeleteUser deleteUser(long userId);

    ResponseCreateReport createReport(MultipartFile reportDocument, ReportReason reportReason,
                                      String reportTitle, String reportContent, long userId, long reporterId);
}
