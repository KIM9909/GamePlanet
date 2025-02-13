package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileResponse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_tile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TileEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer tileId;

	@Column(length = 20)
	private String tileName;

	@Column(length = 50)
	private String tileType;

	@Column(length = 100)
	private String tileImageUrl;

	private Integer tilePrice;

	public TileEntity(String tileName, String tileType, String tileImageUrl, Integer tilePrice, Integer tileNumber) {
		this.tileName = tileName;
		this.tileType = tileType;
		this.tileImageUrl = tileImageUrl;
		this.tilePrice = tilePrice;
		this.tileNumber = tileNumber;
	}

	private Integer tileNumber;

	public TileEntity update(CustomTileRequest customTileRequest) {
		return TileEntity.builder()
			.tileName(customTileRequest.getTileName())
			.tileType(this.tileType)
			.tileImageUrl(customTileRequest.getTileImageUrl())
			.tilePrice(customTileRequest.getTilePrice())
			.tileNumber(this.tileNumber)
			.build();
	}

	public static TileResponse toResponse(TileEntity tileEntity) {
		return TileResponse.builder()
			.tileId(tileEntity.getTileId())
			.tileName(tileEntity.getTileName())
			.tileType(tileEntity.getTileType())
			.tileImageUrl(tileEntity.getTileImageUrl())
			.tilePrice(tileEntity.getTilePrice())
			.tileNumber(tileEntity.getTileNumber())
			.build();
	}
}