package com.meeple.meeple_back.user.controller;

import com.meeple.meeple_back.user.model.UserRegistDto;
import com.meeple.meeple_back.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public void regist(@RequestBody UserRegistDto registerRequest) {
        userService.regist(registerRequest);
    }

    // TODO : 유저 중복 체크
    @GetMapping("/check")
    public ResponseEntity<Boolean> isDuplicate(@RequestParam long userId){
        boolean isDuplicate = userService.isDuplicate(userId);
        return ResponseEntity.ok(isDuplicate);
    }
}
