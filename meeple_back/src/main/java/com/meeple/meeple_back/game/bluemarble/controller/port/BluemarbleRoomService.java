package com.meeple.meeple_back.game.bluemarble.controller.port;

import com.meeple.meeple_back.game.bluemarble.domain.Room;
import com.meeple.meeple_back.game.bluemarble.domain.RoomCreate;
import java.util.List;

public interface BluemarbleRoomService {

	Room create(RoomCreate roomCreate);

	Room join(int roomId, long userId);

	List<Room> getList();
}
