package com.meeple.meeple_back.user.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserUpdateRequest {
    private String userName;
    private String userNickname;
    private LocalDateTime userBirthday;
}