package com.meeple.meeple_back.game.bluemarble.service;

import com.meeple.meeple_back.common.domain.exception.ResourceNotFoundException;
import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.domain.Room;
import com.meeple.meeple_back.game.bluemarble.domain.RoomCreate;
import com.meeple.meeple_back.game.bluemarble.infrastructure.RoomEntity;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleRoomRepository;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BluemarbleRoomServiceImpl implements BluemarbleRoomService {

	private static final String ROOM_KEY = "BLUDMARBLE_ROOMS";

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
		List<Player> players = new ArrayList<>();
		players.add(newPlayer);

		Room room = Room.builder().roomId(roomEntity.getRoomId()).roomName(roomEntity.getRoomName())
				.createTime(roomEntity.getCreateTime()).isPrivate(roomCreate.isPrivate())
				.password(roomCreate.getPassword()).isGameStart(false)
				.creator(roomCreate.getCreator())
				.maxPlayers(roomCreate.getMaxPlayers()).players(players).build();

		roomRedisTemplate.opsForHash().put(ROOM_KEY, room.getRoomId(), room);
		return room;
	}


	@Override
	public Room join(int roomId, long userId) {
		Room room = getRoom(roomId);
		room.getPlayers().add(new Player((int) userId));
		roomRedisTemplate.opsForHash().put(ROOM_KEY, roomId, room);
		return room;
	}

	@Override
	public List<Room> getList() {
		return roomRedisTemplate.opsForHash().values(ROOM_KEY).stream()
				.map(Room.class::cast).filter(room -> !room.isPrivate()).toList();
	}

	public Room getRoom(int roomId) {
		Room room = (Room) roomRedisTemplate.opsForHash().get(ROOM_KEY, roomId);
		if (Objects.isNull(room)) {
			throw new ResourceNotFoundException("Room", roomId);
		}
		return room;
	}

}
