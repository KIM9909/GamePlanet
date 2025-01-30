package com.meeple.meeple_back.game.bluemarble.service.port;

import com.meeple.meeple_back.game.bluemarble.infrastructure.RoomEntity;

public interface BluemarbleRoomRepository {

	RoomEntity save(RoomEntity room);
}
