//package com.meeple.meeple_back.user.service;
//
//
//import com.meeple.meeple_back.user.model.User;
//import com.meeple.meeple_back.user.model.UserRegistDto;
//import com.meeple.meeple_back.user.repository.UserRepository;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//@Service
//public class UserService {
//    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
//        this.userRepository = userRepository;
//        this.passwordEncoder = passwordEncoder;
//    }
//
//
//    public void regist(UserRegistDto user) {
//        userRepository.save(User.builder()
//                .userName(user.getUserName())
//                .userPassword(passwordEncoder.encode(user.getUserPassword()))
//                .userEmail(user.getUserEmail())
//                .userBirthday(user.getUserBirthday())
//                .userNickname(user.getUserNickname())
//                .build());
//    }
//}
