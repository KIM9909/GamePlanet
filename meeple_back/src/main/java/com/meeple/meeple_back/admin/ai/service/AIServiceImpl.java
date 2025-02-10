package com.meeple.meeple_back.admin.ai.service;

import com.meeple.meeple_back.admin.ai.model.request.RequestLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogin;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AIServiceImpl implements AIService{
    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;


    /* redis에 클라이언트 켜짐 추가 */
    @Override
    public ResponseLogin login(RequestLogin request) {
        User user = userRepository.findByUserEmail(request.getUserEmail())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 이메일입니다."));

        if (passwordEncoder.matches(request.getPassword(), user.getUserPassword())) {
            System.out.println("일치");
            System.out.println("일치");
            System.out.println("일치");
            ResponseLogin response = ResponseLogin.builder()
                    .isSuccess(true)
                    .userId(user.getUserId())
                    .userNickname(user.getUserNickname())
                    .build();

            return response;
        } else {
            System.out.println("불일치");
            ResponseLogin response = ResponseLogin.builder()
                    .isSuccess(false)
                    .build();

            return response;
        }
    }
}
