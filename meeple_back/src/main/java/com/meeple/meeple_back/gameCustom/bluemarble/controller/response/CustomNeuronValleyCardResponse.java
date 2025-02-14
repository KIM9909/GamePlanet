package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardEntity;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CustomNeuronValleyCardResponse {
	private Integer cardId;

	private Integer cardNumber;

	private String cardName;

	private String cardDescription;

	private String cardType;

	public static CustomNeuronValleyCardResponse from(CustomCardEntity customCardEntity) {
		return CustomNeuronValleyCardResponse.builder()
				.cardId(customCardEntity.getCard().getCardId())
				.cardNumber(customCardEntity.getCard().getCardNumber())
				.cardName(customCardEntity.getCard().getCardName())
				.cardDescription(customCardEntity.getCard().getCardDescription())
				.cardType(customCardEntity.getCard().getCardType())
				.build();
	}

	public static CustomNeuronValleyCardResponse fromCardEntity(CardEntity cardEntity) {
		return CustomNeuronValleyCardResponse.builder()
				.cardId(cardEntity.getCardId())
				.cardNumber(cardEntity.getCardNumber())
				.cardName(cardEntity.getCardName())
				.cardDescription(cardEntity.getCardDescription())
				.cardType(cardEntity.getCardType())
				.build();
	}
}
