package com.meeple.meeple_back.game.bluemarble.controller.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RoomUpdatePassword {

	private String password;

	public String getPassword() {
		return password;
	}


}
