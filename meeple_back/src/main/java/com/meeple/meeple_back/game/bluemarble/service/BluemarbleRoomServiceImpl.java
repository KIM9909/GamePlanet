package com.meeple.meeple_back.game.bluemarble.service;

import com.meeple.meeple_back.common.domain.exception.ResourceNotFoundException;
import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleRoomService;
import com.meeple.meeple_back.game.bluemarble.controller.request.RoomJoinWithPassword;
import com.meeple.meeple_back.game.bluemarble.controller.request.RoomUpdatePassword;
import com.meeple.meeple_back.game.bluemarble.domain.Player;
import com.meeple.meeple_back.game.bluemarble.domain.Room;
import com.meeple.meeple_back.game.bluemarble.domain.RoomCreate;
import com.meeple.meeple_back.game.bluemarble.domain.RoomUpdate;
import com.meeple.meeple_back.game.bluemarble.exception.PrivateRoomInvalidPasswordException;
import com.meeple.meeple_back.game.bluemarble.infrastructure.RoomEntity;
import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleRoomRepository;
import com.meeple.meeple_back.game.game.model.Game;
import com.meeple.meeple_back.game.game.model.GameEnum;
import com.meeple.meeple_back.game.repo.GameRepository;
import com.meeple.meeple_back.user.model.User;
import com.meeple.meeple_back.user.service.UserService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BluemarbleRoomServiceImpl implements BluemarbleRoomService {

	private static final String AI_KEY = "AI_APP_STATUS";
	private final BluemarbleRoomRepository bluemarbleRoomRepository;
	private final GameRepository gameRepository;
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	private final RedisTemplate<String, Object> redisTemplate;
	private final SimpMessageSendingOperations messagingTemplate;

	@Override
	@Transactional
	public Room create(long userId, RoomCreate roomCreate) {
		User user = userService.findById(userId);
		if (!redisTemplate.opsForHash().get(AI_KEY, user.getUserNickname()).equals("ON")
		) {
			throw new ResourceNotFoundException("AI 프로그램을 켰는지 확인해주세요", 0);
		}
		Game bluemarble = gameRepository.getReferenceById(GameEnum.BLUEMARBLE.getGameId());
		RoomEntity roomEntity = RoomEntity.builder().roomName(roomCreate.getRoomName()).createTime(
						LocalDateTime.now()).game(bluemarble)
				.build();
		bluemarbleRoomRepository.save(roomEntity);

		Player newPlayer = Player.init(userService.findById(userId));
		List<Player> players = new ArrayList<>();
		players.add(newPlayer);

		Room room = Room.builder().roomId(roomEntity.getRoomId()).roomName(roomEntity.getRoomName())
				.createTime(roomEntity.getCreateTime()).isPrivate(roomCreate.isPrivate())
				.password(passwordEncoder.encode(roomCreate.getPassword())).isGameStart(false)
				.creator(Player.init(userService.findById(userId)))
				.maxPlayers(roomCreate.getMaxPlayers()).players(players).build();
		bluemarbleRoomRepository.save(room);
		return room;
	}


	@Override
	@Transactional
	public Room join(int roomId, long userId) {
		User user = userService.findById(userId);
		if (!redisTemplate.opsForHash().get(AI_KEY, user.getUserNickname()).equals("ON")
		) {
			throw new ResourceNotFoundException("AI 프로그램을 켰는지 확인해주세요", 0);
		}
		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
		room = room.addPlayer(Player.init(userService.findById(userId)));
		bluemarbleRoomRepository.save(room);
		return room;
	}

	@Override
	@Transactional(readOnly = true)
	public List<Room> getList() {
		return bluemarbleRoomRepository.findAll();
	}

	@Override
	public Room delete(int roomId, long currentUserId) {
		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
		Player removed = room.removePlayer((int) currentUserId)
				.orElseThrow(() -> new ResourceNotFoundException("Player", currentUserId));
		User user = userService.findById(currentUserId);
		if (room.isPlayerNotExists()) {
			bluemarbleRoomRepository.delete(room);
			return room;
		}

		if (room.isCreator(removed.getPlayerId())) {
			room.changeCreator();
		}
		messagingTemplate.convertAndSend("/topic/ai-record" + user.getUserNickname(), "녹음 종료");
		return bluemarbleRoomRepository.save(room);
	}

	@Override
	@Transactional
	public Room update(int roomId, RoomUpdate roomUpdate) {
		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
		Room updatedRoom = room.update(roomUpdate);
		bluemarbleRoomRepository.save(updatedRoom);
		return updatedRoom;
	}

	@Override
	@Transactional(readOnly = true)
	public Room findById(int roomId) {
		return bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
	}

	@Override
	@Transactional(readOnly = true)
	public List<Room> search(String searchName) {
		return bluemarbleRoomRepository.findByRoomName(searchName);
	}

	@Override
	@Transactional
	public Room changePassword(int roomId, RoomUpdatePassword roomUpdatePassword) {
		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));

		room.changePassword(passwordEncoder.encode(roomUpdatePassword.getPassword()));
		bluemarbleRoomRepository.save(room);
		return room;
	}

	@Override
	@Transactional
	public Room joinWithPassword(int roomId, int userId,
			RoomJoinWithPassword roomJoinWithPassword) {
		User user = userService.findById(userId);

		Room room = bluemarbleRoomRepository.findById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room", roomId));
		if (!redisTemplate.opsForHash().get(AI_KEY, user.getUserNickname()).equals("ON")
		) {
			throw new ResourceNotFoundException("AI 프로그램을 켰는지 확인해주세요", 0);
		}
		boolean isCorrectPassword = passwordEncoder.matches(roomJoinWithPassword.getPassword(),
				room.getPassword());
		if (!isCorrectPassword) {
			throw new PrivateRoomInvalidPasswordException("비밀번호가 일치하지 않습니다.", roomId);
		}
		room = room.addPlayer(
				Player.init(userService.findById(userId)));
		bluemarbleRoomRepository.save(room);
		return room;
	}


}
