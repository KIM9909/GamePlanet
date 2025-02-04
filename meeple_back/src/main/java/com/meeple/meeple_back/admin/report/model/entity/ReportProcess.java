package com.meeple.meeple_back.admin.report.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_report_process")
public class ReportProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reportProcessId")
    private int reportProcessId;

    @Column(name = "report_process_time")
    private LocalDateTime reportProcessTime;

//    @Column(n)

}
