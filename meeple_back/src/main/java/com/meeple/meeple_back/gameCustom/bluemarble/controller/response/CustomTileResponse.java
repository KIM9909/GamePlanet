package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomTileEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomTileResponse {
	private int customId;
	private TileResponse tile;

	public static CustomTileResponse from(CustomTileEntity customTileEntity) {
		return CustomTileResponse.builder()
			.customId(customTileEntity.getCustomElement().getCustomId())
			.tile(TileResponse.from(customTileEntity.getTileEntity()))
			.build();
	}
}
