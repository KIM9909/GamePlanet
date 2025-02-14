package com.meeple.meeple_back.gameCustom.bluemarble.controller.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomSeedcardRequest {

	@JsonProperty("cardNumber")
	private Integer cardNumber;

	@JsonProperty("cardName")
	private String cardName;

	@JsonProperty("cardDescription")
	private String cardDescription;

	@JsonProperty("cardType")
	private String cardType;

	@JsonProperty("cardColor")
	private String cardColor;

	@JsonProperty("cardSeedCount")
	private Integer cardSeedCount;

	@JsonProperty("cardBaseConstructionCost")
	private Integer cardBaseConstructionCost;

	@JsonProperty("cardHeadquartersUsageFee")
	private Integer cardHeadquartersUsageFee;

	@JsonProperty("cardBaseUsageFee")
	private Integer cardBaseUsageFee;

	@JsonCreator
	public CustomSeedcardRequest(
			@JsonProperty("cardNumber") Integer cardNumber,
			@JsonProperty("cardName") String cardName,
			@JsonProperty("cardDescription") String cardDescription,
			@JsonProperty("cardType") String cardType,
			@JsonProperty("cardColor") String cardColor,
			@JsonProperty("cardSeedCount") Integer cardSeedCount,
			@JsonProperty("cardBaseConstructionCost") Integer cardBaseConstructionCost,
			@JsonProperty("cardHeadquartersUsageFee") Integer cardHeadquartersUsageFee,
			@JsonProperty("cardBaseUsageFee") Integer cardBaseUsageFee) {
		this.cardNumber = cardNumber;
		this.cardName = cardName;
		this.cardDescription = cardDescription;
		this.cardType = cardType;
		this.cardColor = cardColor;
		this.cardSeedCount = cardSeedCount;
		this.cardBaseConstructionCost = cardBaseConstructionCost;
		this.cardHeadquartersUsageFee = cardHeadquartersUsageFee;
		this.cardBaseUsageFee = cardBaseUsageFee;
	}


}
