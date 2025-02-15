package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Data
@Builder
public class CustomElementResponse {
	private int customId;
	private String customName;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Long userId;
	public static CustomElementResponse from(CustomElementEntity entity) {
		return CustomElementResponse.builder()
			.customId(entity.getCustomId())
			.customName(entity.getCustomName())
			.createdAt(entity.getCreatedAt())
			.userId(entity.getUser().getUserId())
			.updatedAt(entity.getUpdatedAt())
			.build();
	}
}
