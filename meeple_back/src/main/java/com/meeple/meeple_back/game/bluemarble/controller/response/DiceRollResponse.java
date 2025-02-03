package com.meeple.meeple_back.game.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.DiceRollResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DiceRollResponse {

	private final int prevPosition;

	private final int nextPosition;

	public static DiceRollResponse from(DiceRollResult diceRollResult) {
		return DiceRollResponse.builder()
				.prevPosition(diceRollResult.getPrevPosition())
				.nextPosition(diceRollResult.getNextPosition())
				.build();
	}
}
