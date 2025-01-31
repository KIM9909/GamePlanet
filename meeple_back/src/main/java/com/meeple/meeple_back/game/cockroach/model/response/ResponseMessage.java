package com.meeple.meeple_back.game.cockroach.model.response;

import com.meeple.meeple_back.game.cockroach.model.entity.Room;
import com.meeple.meeple_back.user.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ResponseMessage {
    private String roomId;
    private String sender;
    private String content;
    private LocalDateTime timestamp;
}
