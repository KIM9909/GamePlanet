package com.meeple.meeple_back.user.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseUserList {
    int code;
    String message;
    List<User> userList;
}
