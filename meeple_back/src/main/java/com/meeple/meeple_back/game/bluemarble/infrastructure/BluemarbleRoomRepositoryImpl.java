package com.meeple.meeple_back.game.bluemarble.infrastructure;

import com.meeple.meeple_back.game.bluemarble.service.port.BluemarbleRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;


@Repository
@RequiredArgsConstructor
public class BluemarbleRoomRepositoryImpl implements BluemarbleRoomRepository {

	private final BluemarbleRoomJpaRepository bluemarbleRoomJpaRepository;

	@Override
	public RoomEntity save(RoomEntity room) {
		return bluemarbleRoomJpaRepository.save(room);
	}

}
