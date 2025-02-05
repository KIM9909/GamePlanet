package com.meeple.meeple_back.game.bluemarble.domain;

import lombok.Data;

@Data
public class DiceRollResult {

	private final int prevPosition;
	private final int nextPosition;
}
