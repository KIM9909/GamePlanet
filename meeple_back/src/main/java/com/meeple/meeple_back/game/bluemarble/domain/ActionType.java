package com.meeple.meeple_back.game.bluemarble.domain;

import lombok.Getter;

@Getter
public enum ActionType {
	ROLL_DICE("ROLL_DICE"), PAY_TOLL("PAY_TOLL"), BUY_LAND("BUY_LAND"), END("END"), USE_CARD(
			"USE_CARD"
	), BROKEN("BROKEN"), DO_YOU_WANT_TO_BUY_THE_LAND("DO_YOU_WANT_TO_BUY_THE_LAND"), BUILD_BASE(
			"BUILD_BASE"
	), DO_YOU_WANT_TO_BUILD_THE_BASE("DO_YOU_WANT_TO_BUILD_THE_BASE"), DRAW_CARD("DRAW_CARD"), TURN_END("TURN_END"), DOUBLE_DICE("DOUBLE_DICE"), CHECK_END("CHECK_END");

	private final String action;

	ActionType(String action) {
		this.action = action;
	}
}