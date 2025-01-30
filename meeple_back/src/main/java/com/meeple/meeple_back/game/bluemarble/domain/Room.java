package com.meeple.meeple_back.game.bluemarble.domain;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@RedisHash("Room")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

	@Id
	private int roomId;

	@NotBlank(message = "Room name is mandatory")
	private String roomName;

	private LocalDateTime createTime;

	private boolean isPrivate;

	private String password;

	private boolean isGameStart;

	@NotBlank(message = "Creator is mandatory")
	private int creator;

	@Min(value = 1, message = "Max players must be at least 1")
	private int maxPlayers;

	private Map<Integer, Player> players;

}
