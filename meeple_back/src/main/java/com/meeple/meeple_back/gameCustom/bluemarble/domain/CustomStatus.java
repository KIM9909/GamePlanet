package com.meeple.meeple_back.gameCustom.bluemarble.domain;

import lombok.Getter;

@Getter
public enum CustomStatus {
	BEFORE("신청전"), SUBMITTED("신청완료"), IN_REVIEW("심사진행중"), COMPLETED("심사완료");

	private final String name;

	CustomStatus(String name) {
		this.name = name;
	}

}
