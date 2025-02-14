package com.meeple.meeple_back.gameCustom.bluemarble.controller.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomCardRequest {
	@JsonProperty("cardName")
	private String cardName;

	@JsonProperty("cardDescription")
	private String cardDescription;

	@JsonProperty("cardColor")
	private String cardColor;

	@JsonProperty("cardBaseConstructionCost")
	private Integer cardBaseConstructionCost;

	@JsonProperty("cardHeadquartersUsageFee")
	private Integer cardHeadquartersUsageFee;

	@JsonProperty("cardBaseUsageFee")
	private Integer cardBaseUsageFee;

	@JsonCreator
	public CustomCardRequest(@JsonProperty("cardName") String cardName, @JsonProperty("cardDescription") String cardDescription,
			@JsonProperty("cardColor") String cardColor, @JsonProperty("cardBaseConstructionCost") Integer cardBaseConstructionCost,
			@JsonProperty("cardHeadquartersUsageFee") Integer cardHeadquartersUsageFee, @JsonProperty("cardBaseUsageFee") Integer cardBaseUsageFee) {
		this.cardName = cardName;
		this.cardDescription = cardDescription;
		this.cardColor = cardColor;
		this.cardBaseConstructionCost = cardBaseConstructionCost;
		this.cardHeadquartersUsageFee = cardHeadquartersUsageFee;
		this.cardBaseUsageFee = cardBaseUsageFee;
	}
}
