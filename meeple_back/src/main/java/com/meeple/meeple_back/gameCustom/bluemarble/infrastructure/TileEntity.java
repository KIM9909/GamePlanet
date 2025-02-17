package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.game.bluemarble.domain.Tile;
import com.meeple.meeple_back.game.bluemarble.domain.TileType;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTileCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.TileResponse;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
	private Integer tileNumber;

	public TileEntity(String tileName, String tileType, String tileImageUrl, Integer tilePrice,
			Integer tileNumber) {
		this.tileName = tileName;
		this.tileType = tileType;
		this.tileImageUrl = tileImageUrl;
		this.tilePrice = tilePrice;
		this.tileNumber = tileNumber;
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

	public static Tile toTile(TileEntity tileEntity) {
		return Tile.builder()
				.id(tileEntity.getTileNumber())
				.name(tileEntity.getTileName())
				.type(TileType.valueOf(tileEntity.getTileType()))
				.imageUrl(tileEntity.getTileImageUrl())
				.price(tileEntity.getTilePrice())
				.ownerId(0)
				.tollPrice(0)
				.hasBase(false)
				.build();
	}

	public TileEntity update(CustomTileCardRequest customTileCardRequest) {
		return TileEntity.builder().tileId(this.tileId)
				.tileNumber(this.tileNumber)
				.tileName(customTileCardRequest.getName())
				.tileImageUrl(customTileCardRequest.getImageUrl())
				.tilePrice(customTileCardRequest.getNumber()).tileType(this.tileType).build();
	}
}