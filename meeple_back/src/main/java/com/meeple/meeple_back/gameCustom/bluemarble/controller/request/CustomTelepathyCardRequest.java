package com.meeple.meeple_back.gameCustom.bluemarble.controller.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomTelepathyCardRequest {
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

	@JsonCreator
	public CustomTelepathyCardRequest(
			@JsonProperty("cardNumber") Integer cardNumber,
			@JsonProperty("cardName") String cardName,
			@JsonProperty("cardDescription") String cardDescription,
			@JsonProperty("cardType") String cardType,
			@JsonProperty("cardColor") String cardColor) {
		this.cardNumber = cardNumber;
		this.cardName = cardName;
		this.cardDescription = cardDescription;
		this.cardType = cardType;
		this.cardColor = cardColor;
	}
}
