package com.meeple.meeple_back.game.bluemarble.domain;

import lombok.Getter;

@Getter
public enum ActionType {
	ROLL_DICE("ROLL_DICE"), PAY_TOLL("PAY_TOLL"), BUY_LAND("BUY_LAND"), END("END"), USE_CARD(
			"USE_CARD"
	), BROKEN("BROKEN");

	private final String action;

	ActionType(String action) {
		this.action = action;
	}
}