package com.meeple.meeple_back.user.service;


import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.model.UserProfileResponse;
import com.meeple.meeple_back.user.model.UserRegistDto;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}


	public void regist(UserRegistDto user) {
		userRepository.save(User.builder()
				.userName(user.getUserName())
				.userPassword(passwordEncoder.encode(user.getUserPassword()))
				.userEmail(user.getUserEmail())
				.userBirthday(user.getUserBirthday())
				.userNickname(user.getUserNickname())
				.build());
	}


	public boolean isDuplicateEmail(String userEmail) {
		return userRepository.existsUserByUserEmail(userEmail);
	}

	public boolean isDuplicateNickname(String userNickname) {
		return userRepository.existsUserByUserNickname(userNickname);

	}

	@Transactional(readOnly = true)
	public UserProfileResponse getUserProfile(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

		return UserProfileResponse.builder()
				.userName(user.getUserName())
				.userNickname(user.getUserNickname())
				.userProfilePictureUrl(user.getUserProfilePictureUrl())
				.userTier(user.getUserTier())
				.userLevel(user.getUserLevel())
				.userCreatedAt(user.getUserCreatedAt())
				.build();
	}
}
