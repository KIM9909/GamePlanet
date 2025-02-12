package com.meeple.meeple_back.gameCustom.bluemarble.controller.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomTileRequest {


	@JsonProperty("customId")
	private int customId;

	@JsonProperty("tileNumber")
	private Integer tileNumber;

	@JsonProperty("tileName")
	private String tileName;

	@JsonProperty("tileType")
	private String tileType;

	@JsonProperty("tileImageUrl")
	private String tileImageUrl;

	@JsonProperty("tilePrice")
	private Integer tilePrice;

	@JsonCreator
	public CustomTileRequest(@JsonProperty("customId") int customId, @JsonProperty("tileNumber") Integer tileNumber, @JsonProperty("tileName") String tileName, @JsonProperty("tileType") String tileType,
	                         @JsonProperty("tileImageUrl") String tileImageUrl, @JsonProperty("tilePrice") Integer tilePrice) {
		this.customId = customId;
		this.tileNumber = tileNumber;
		this.tileName = tileName;
		this.tileType = tileType;
		this.tileImageUrl = tileImageUrl;
		this.tilePrice = tilePrice;
	}
}
