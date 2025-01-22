package com.meeple.meeple_back.user.controller;

import com.meeple.meeple_back.user.model.UserRegistDto;
import com.meeple.meeple_back.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/register")
	public ResponseEntity<Void> regist(@Valid @RequestBody UserRegistDto registerRequest) {
		userService.regist(registerRequest);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}


	/**
	 * [유저 중복 확인] 유저 아이디가 중복되는지 확인한다.
	 *
	 * @param userId
	 * @return 중복되면 true, 중복되지 않으면 false
	 */
	@GetMapping("/check")
	public ResponseEntity<Boolean> isDuplicate(@RequestParam long userId) {
		boolean isDuplicate = userService.isDuplicate(userId);
		return ResponseEntity.ok(isDuplicate);
	}

	/**
	 * [이메일 중복 확인] 이메일이 중복되는지 확인한다.
	 *
	 * @param userEmail
	 * @return 중복되면 true, 중복되지 않으면 false
	 */
	@GetMapping("/checkEmail")
	public ResponseEntity<Boolean> isDuplicateEmail(@RequestParam String userEmail) {
		boolean isDuplicate = userService.isDuplicateEmail(userEmail);
		return ResponseEntity.ok(isDuplicate);
	}

	/**
	 * [닉네임 중복 확인] 닉네임이 중복되는지 확인한다.
	 *
	 * @param userNickname
	 * @return 중복되면 true, 중복되지 않으면 false
	 */
	@GetMapping("/checkNickname")
	public ResponseEntity<Boolean> isDuplicateNickname(@RequestParam String userNickname) {
		boolean isDuplicate = userService.isDuplicateNickname(userNickname);
		return ResponseEntity.ok(isDuplicate);
	}
}
