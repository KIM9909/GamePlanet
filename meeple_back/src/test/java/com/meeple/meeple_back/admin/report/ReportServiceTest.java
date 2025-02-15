package com.meeple.meeple_back.admin.report;

import com.meeple.meeple_back.admin.report.model.ReportReason;
import com.meeple.meeple_back.admin.report.model.ReportResult;
import com.meeple.meeple_back.admin.report.model.entity.Report;
import com.meeple.meeple_back.admin.report.model.entity.ReportProcess;
import com.meeple.meeple_back.admin.report.model.request.RequestCreateReport;
import com.meeple.meeple_back.admin.report.model.request.RequestProcessReport;
import com.meeple.meeple_back.admin.report.model.request.RequestUpdateProcess;
import com.meeple.meeple_back.admin.report.model.response.ResponseCreateReport;
import com.meeple.meeple_back.admin.report.model.response.ResponseDeleteUser;
import com.meeple.meeple_back.admin.report.model.response.ResponseProcessReport;
import com.meeple.meeple_back.admin.report.model.response.ResponseReport;
import com.meeple.meeple_back.admin.report.model.response.ResponseReportList;
import com.meeple.meeple_back.admin.report.model.response.ResponseUpdateProcess;
import com.meeple.meeple_back.admin.report.repo.ReportProcessRepository;
import com.meeple.meeple_back.admin.report.repo.ReportRepository;
import com.meeple.meeple_back.admin.report.service.ReportSerivceImpl;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReportProcessRepository reportProcessRepository;

    @Spy
    private ModelMapper mapper = new ModelMapper();

    @InjectMocks
    private ReportSerivceImpl reportService;

    @BeforeEach
    void setUp() {
        // ModelMapper 설정이 필요한 경우 여기서 추가 가능 (예: MatchingStrategies.STRICT)
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
    }

    // deleteUser() 테스트
    @Test
    public void testDeleteUser_Success() {
        // given
        long userId = 1L;
        User user = new User();
        user.setUserId(userId);
        user.setUserNickname("TestUser");
        user.setUserDeletedAt(null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // when
        ResponseDeleteUser response = reportService.deleteUser(userId);

        // then
        assertEquals(200, response.getCode());
        assertEquals("삭제 완료", response.getMessage());
        assertNotNull(user.getUserDeletedAt());
        verify(userRepository).save(user);
    }

    @Test
    public void testDeleteUser_UserNotFound() {
        long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            reportService.deleteUser(userId);
        });
        assertEquals("존재하지 않는 회원", exception.getMessage());
    }

    // createReport() 테스트
    @Test
    public void testCreateReport_Success() {
        // given
        RequestCreateReport request = new RequestCreateReport();
        request.setUserId(2L);
        request.setReporterId(1L);
        request.setReportReason(ReportReason.ETC);
        request.setReportTitle("Inappropriate Content");
        request.setReportContent("신고 내용 상세...");

        User reportedUser = new User();
        reportedUser.setUserId(2L);
        reportedUser.setUserNickname("ReportedUser");

        User reporter = new User();
        reporter.setUserId(1L);
        reporter.setUserNickname("ReporterUser");

        when(userRepository.findById(2L)).thenReturn(Optional.of(reportedUser));
        when(userRepository.findById(1L)).thenReturn(Optional.of(reporter));

        // when
        ResponseCreateReport response = reportService.createReport(request);

        // then
        assertEquals(200, response.getCode());
        assertEquals("ReportedUser에 대한 신고가 정상적으로 접수되었습니다.", response.getMessage());
        verify(reportRepository).save(any(Report.class));
    }

    // findReportList() 테스트
    @Test
    public void testFindReportList() {
        // given
        Report report1 = Report.builder().reportTitle("Report 1").build();
        Report report2 = Report.builder().reportTitle("Report 2").build();
        List<Report> reports = Arrays.asList(report1, report2);
        when(reportRepository.findAll()).thenReturn(reports);

        ResponseReportList response1 = new ResponseReportList();
        response1.setReportTitle("Report 1");
        ResponseReportList response2 = new ResponseReportList();
        response2.setReportTitle("Report 2");

        when(mapper.map(report1, ResponseReportList.class)).thenReturn(response1);
        when(mapper.map(report2, ResponseReportList.class)).thenReturn(response2);

        // when
        List<ResponseReportList> result = reportService.findReportList();

        // then
        assertEquals(2, result.size());
        assertEquals("Report 1", result.get(0).getReportTitle());
        assertEquals("Report 2", result.get(1).getReportTitle());
    }

    // findReport() 테스트
    @Test
    public void testFindReport() {
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        // given
        int reportId = 1;
        Report report = Report.builder().reportTitle("Detailed Report").build();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        ResponseReport responseReport = new ResponseReport();
        responseReport.setReportTitle("Detailed Report");
        when(mapper.map(report, ResponseReport.class)).thenReturn(responseReport);

        // when
        ResponseReport result = reportService.findReport(reportId);

        // then
        assertEquals("Detailed Report", result.getReportTitle());
    }

    // processReport() 테스트 - PASS
    @Test
    public void testProcessReport_Pass() {
        // given
        RequestProcessReport request = new RequestProcessReport();
        request.setReportId(1);
        request.setReportResult("PASS");
        request.setReportMemo("No issues found");

        Report report = Report.builder().processStatus("WAIT").build();
        // BAN, WARNING 등에서 report.getUser()를 참조하므로 더미 User 설정
        report.setUser(new User());

        when(reportRepository.findById(1)).thenReturn(Optional.of(report));

        // when
        ResponseProcessReport response = reportService.processReport(request);

        // then
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("무혐의"));
        assertEquals("PASS", report.getProcessStatus());
        assertEquals("No issues found", report.getReportMemo());
        verify(reportRepository).save(report);
    }

    // processReport() 테스트 - WARNING
    @Test
    public void testProcessReport_Warning() {
        // given
        RequestProcessReport request = new RequestProcessReport();
        request.setReportId(2);
        request.setReportResult("WARNING");
        request.setReportMemo("User warned for misconduct");

        User reportedUser = new User();
        Report report = Report.builder().processStatus("WAIT").build();
        report.setUser(reportedUser);

        when(reportRepository.findById(2)).thenReturn(Optional.of(report));

        // when
        ResponseProcessReport response = reportService.processReport(request);

        // then
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("경고"));
        assertEquals("WARNING", report.getProcessStatus());
        assertEquals("User warned for misconduct", report.getReportMemo());
        verify(reportProcessRepository).save(any(ReportProcess.class));
        verify(reportRepository).save(report);
    }

    // processReport() 테스트 - BAN
    @Test
    public void testProcessReport_Ban() {
        // given
        RequestProcessReport request = new RequestProcessReport();
        request.setReportId(3);
        request.setReportResult("BAN");
        request.setReportMemo("User banned for severe violation");

        User reportedUser = new User();
        Report report = Report.builder().processStatus("WAIT").build();
        report.setUser(reportedUser);

        when(reportRepository.findById(3)).thenReturn(Optional.of(report));

        // when
        ResponseProcessReport response = reportService.processReport(request);

        // then
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("영구제한"));
        assertEquals("BAN", report.getProcessStatus());
        assertEquals("User banned for severe violation", report.getReportMemo());
        assertNotNull(reportedUser.getUserDeletedAt());
        verify(reportProcessRepository).save(any(ReportProcess.class));
        verify(userRepository).save(reportedUser);
        verify(reportRepository).save(report);
    }

    // processReport() 테스트 - 잘못된 결과값
    @Test
    public void testProcessReport_InvalidResult() {
        // given
        RequestProcessReport request = new RequestProcessReport();
        request.setReportId(4);
        request.setReportResult("INVALID");
        request.setReportMemo("Invalid test");

        Report report = Report.builder().processStatus("WAIT").build();
        when(reportRepository.findById(4)).thenReturn(Optional.of(report));

        // when
        ResponseProcessReport response = reportService.processReport(request);

        // then
        assertEquals(500, response.getCode());
        assertEquals("신고 처리가 실패했습니다.", response.getMessage());
    }

    // updateProcess() 테스트 - PASS
    @Test
    public void testUpdateProcess_Pass() {
        // given
        RequestUpdateProcess request = new RequestUpdateProcess();
        request.setReportProcessId(1);
        request.setReportResult("PASS");
        request.setReportMemo("Cleared after review");

        Report report = Report.builder().processStatus("WARNING").build();
        User user = new User();
        // 이전에 BAN 등으로 삭제된 상태를 시뮬레이션
        user.setUserDeletedAt(LocalDateTime.now());
        report.setUser(user);
        ReportProcess reportProcess = ReportProcess.builder().report(report).build();

        when(reportProcessRepository.findById(1)).thenReturn(Optional.of(reportProcess));

        // when
        ResponseUpdateProcess response = reportService.updateProcess(request);

        // then
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("무혐의"));
        assertEquals("PASS", report.getProcessStatus());
        assertEquals("Cleared after review", report.getReportMemo());
        assertNull(user.getUserDeletedAt());
        verify(reportProcessRepository).delete(reportProcess);
        verify(reportRepository).save(report);
    }

    // updateProcess() 테스트 - WARNING
    @Test
    public void testUpdateProcess_Warning() {
        // given
        RequestUpdateProcess request = new RequestUpdateProcess();
        request.setReportProcessId(2);
        request.setReportResult("WARNING");
        request.setReportMemo("Updated warning memo");

        Report report = Report.builder().processStatus("BAN").build();
        User user = new User();
        // BAN 상태였던 사용자
        user.setUserDeletedAt(LocalDateTime.now());
        report.setUser(user);
        ReportProcess reportProcess = ReportProcess.builder().report(report).build();

        when(reportProcessRepository.findById(2)).thenReturn(Optional.of(reportProcess));

        // when
        ResponseUpdateProcess response = reportService.updateProcess(request);

        // then
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("경고"));
        assertEquals("WARNING", report.getProcessStatus());
        assertEquals("Updated warning memo", report.getReportMemo());
        // 사용자 삭제 해제 확인
        assertNull(user.getUserDeletedAt());
        verify(reportProcessRepository).save(reportProcess);
        verify(reportRepository).save(report);
    }

    // updateProcess() 테스트 - BAN
    @Test
    public void testUpdateProcess_Ban() {
        // given
        RequestUpdateProcess request = new RequestUpdateProcess();
        request.setReportProcessId(3);
        request.setReportResult("BAN");
        request.setReportMemo("Enforcing ban after review");

        Report report = Report.builder().processStatus("WARNING").build();
        User user = new User();
        user.setUserDeletedAt(null);
        report.setUser(user);
        ReportProcess reportProcess = ReportProcess.builder().report(report).build();

        when(reportProcessRepository.findById(3)).thenReturn(Optional.of(reportProcess));

        // when
        ResponseUpdateProcess response = reportService.updateProcess(request);

        // then
        assertEquals(200, response.getCode());
        assertTrue(response.getMessage().contains("영구제한"));
        assertEquals("BAN", report.getProcessStatus());
        assertEquals("Enforcing ban after review", report.getReportMemo());
        assertNotNull(user.getUserDeletedAt());
        verify(userRepository).save(user);
        verify(reportRepository).save(report);
        verify(reportProcessRepository).save(reportProcess);
    }

    // updateProcess() 테스트 - 잘못된 결과값
    @Test
    public void testUpdateProcess_InvalidResult() {
        // given
        RequestUpdateProcess request = new RequestUpdateProcess();
        request.setReportProcessId(4);
        request.setReportResult("INVALID");
        request.setReportMemo("Invalid update");

        Report report = Report.builder().processStatus("WAIT").build();
        ReportProcess reportProcess = ReportProcess.builder().report(report).build();

        when(reportProcessRepository.findById(4)).thenReturn(Optional.of(reportProcess));

        // when
        ResponseUpdateProcess response = reportService.updateProcess(request);

        // then
        assertEquals(500, response.getCode());
        assertEquals("처리 불가 백엔드 오류", response.getMessage());
    }

    @Test
    public void testUpdateProcess_ReportProcessNotFound() {
        // given
        RequestUpdateProcess request = new RequestUpdateProcess();
        request.setReportProcessId(100);
        when(reportProcessRepository.findById(100)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            reportService.updateProcess(request);
        });
        assertEquals("존재하지 않는 신고 처리", exception.getMessage());
    }
}
