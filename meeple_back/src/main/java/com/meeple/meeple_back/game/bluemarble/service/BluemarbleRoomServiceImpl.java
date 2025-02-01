package com.meeple.meeple_back.game.bluemarble.service;

import com.meeple.meeple_back.common.domain.exception.ResourceNotFoundException;
import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.domain.Room;
import com.meeple.meeple_back.game.bluemarble.domain.RoomCreate;
import com.meeple.meeple_back.game.bluemarble.domain.RoomUpdate;
import com.meeple.meeple_back.game.bluemarble.infrastructure.RoomEntity;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleRoomRepository;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.user.service.UserService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BluemarbleRoomServiceImpl implements BluemarbleRoomService {

	private final BluemarbleRoomRepository bluemarbleRoomRepository;
	private final GameRepository gameRepository;
	private final UserService userService;

	@Override
	public Room create(RoomCreate roomCreate) {
		Game bluemarble = gameRepository.getReferenceById(roomCreate.getGameId());
		RoomEntity roomEntity = RoomEntity.builder().roomName(roomCreate.getRoomName()).createTime(
						LocalDateTime.now()).game(bluemarble)
				.build();
		bluemarbleRoomRepository.save(roomEntity);

		Player newPlayer = new Player(userService.findById(roomCreate.getCreator()));
		// 초기 유저
		List<Player> players = new ArrayList<>();
		players.add(newPlayer);

		Room room = Room.builder().roomId(roomEntity.getRoomId()).roomName(roomEntity.getRoomName())
				.createTime(roomEntity.getCreateTime()).isPrivate(roomCreate.isPrivate())
				.password(roomCreate.getPassword()).isGameStart(false)
				.creator(new Player(userService.findById(roomCreate.getCreator())))
				.maxPlayers(roomCreate.getMaxPlayers()).players(players).build();
		bluemarbleRoomRepository.save(room);
		return room;
	}


	@Override
	public Room join(int roomId, long userId) {
		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
		room = room.addPlayer(new Player(userService.findById(userId)));
		bluemarbleRoomRepository.save(room);
		return room;
	}

	@Override
	public List<Room> getList() {
		return bluemarbleRoomRepository.findAll();
	}

	@Override
	public Room delete(int roomId, long currentUserId) {
		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
		Player removed = room.removePlayer((int) currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("Player", currentUserId));
		if (room.isPlayerNotExists()) {
			bluemarbleRoomRepository.delete(room);
			return room;
		}

		if (room.isCreator(removed.getPlayerId())) {
			room.changeCreator();
		}
		return bluemarbleRoomRepository.save(room);
	}

	@Override
	public Room update(int roomId, RoomUpdate roomUpdate) {
		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
		Room updatedRoom = room.update(roomUpdate);
		bluemarbleRoomRepository.save(updatedRoom);
		return updatedRoom;
	}

	@Override
	public Room startGame(int roomId) {
		return null;
	}

	@Override
	public Room findById(int roomId) {
		return bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
	}


}
