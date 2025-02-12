package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.TileEntity;
import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TileResponse {
	private Integer tileId;

	@Column(length = 20)
	private String tileName;

	@Column(length = 50)
	private String tileType;

	@Column(length = 100)
	private String tileImageUrl;

	private Integer tilePrice;

	private Integer tileNumber;

	public static TileResponse from(TileEntity tileEntity) {
		return TileResponse.builder().tileId(tileEntity.getTileId()).tileName(tileEntity.getTileName())
				.tileType(tileEntity.getTileType()).tileImageUrl(tileEntity.getTileImageUrl())
				.tilePrice(tileEntity.getTilePrice()).tileNumber(tileEntity.getTileNumber()).build();

	}
}
