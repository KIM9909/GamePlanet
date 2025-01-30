package com.meeple.meeple_back.game.bluemarble.service;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.domain.Room;
import com.meeple.meeple_back.game.bluemarble.domain.RoomCreate;
import com.meeple.meeple_back.game.bluemarble.infrastructure.RoomEntity;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleRoomRepository;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BluemarbleRoomServiceImpl implements BluemarbleRoomService {

	private static final String ROOM_KEY = "GAME_ROOMS";

	private final BluemarbleRoomRepository bluemarbleRoomRepository;
	private final GameRepository gameRepository;
	private final RedisTemplate<String, Room> roomRedisTemplate;

	@Override
	public Room create(RoomCreate roomCreate) {
		Game bluemarble = gameRepository.getReferenceById(roomCreate.getGameId());
		RoomEntity roomEntity = RoomEntity.builder().roomName(roomCreate.getRoomName()).createTime(
						LocalDateTime.now()).game(bluemarble)
				.build();
		bluemarbleRoomRepository.save(roomEntity);

		Player newPlayer = new Player(roomCreate.getCreator());
		// 초기 유저
		HashMap<Integer, Player> players = new HashMap<>();
		players.put(1, newPlayer);

		Room room = Room.builder().roomId(roomEntity.getRoomId()).roomName(roomEntity.getRoomName())
				.createTime(roomEntity.getCreateTime()).isPrivate(roomCreate.isPrivate())
				.password(roomCreate.getPassword()).isGameStart(false)
				.creator(roomCreate.getCreator())
				.maxPlayers(roomCreate.getMaxPlayers()).players(players).build();

		roomRedisTemplate.opsForHash().put(ROOM_KEY, room.getRoomId(), room);
		return room;
	}

}
