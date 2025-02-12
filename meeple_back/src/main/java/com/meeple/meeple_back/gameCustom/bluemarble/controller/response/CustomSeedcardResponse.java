package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import com.meeple.meeple_back.game.bluemarble.domain.SeedCertificateCard;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomCardEntity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomSeedcardResponse {

	private Integer cardId;

	private Integer cardNumber;

	private String cardName;

	private String cardDescription;

	private String cardType;

	private String cardColor;

	private Integer cardSeedCount;

	private Integer cardBaseConstructionCost;

	private Integer cardHeadquartersUsageFee;

	private Integer cardBaseUsageFee;


	public static CustomSeedcardResponse from(CustomCardEntity customCardEntity) {
		return CustomSeedcardResponse.builder()
			.cardId(customCardEntity.getCard().getCardId())
			.cardNumber(customCardEntity.getCard().getCardNumber())
			.cardName(customCardEntity.getCard().getCardName())
			.cardDescription(customCardEntity.getCard().getCardDescription())
			.cardType(customCardEntity.getCard().getCardType())
			.cardColor(customCardEntity.getCard().getCardColor())
			.cardSeedCount(customCardEntity.getCard().getCardSeedCount())
			.cardBaseConstructionCost(customCardEntity.getCard().getCardBaseConstructionCost())
			.cardHeadquartersUsageFee(customCardEntity.getCard().getCardHeadquartersUsageFee())
			.cardBaseUsageFee(customCardEntity.getCard().getCardBaseUsageFee())
			.build();
	}

	public static CustomSeedcardResponse fromCardEntity(CardEntity cardEntity){
		return CustomSeedcardResponse.builder()
			.cardId(cardEntity.getCardId())
			.cardNumber(cardEntity.getCardNumber())
			.cardName(cardEntity.getCardName())
			.cardDescription(cardEntity.getCardDescription())
			.cardType(cardEntity.getCardType())
			.cardColor(cardEntity.getCardColor())
			.cardSeedCount(cardEntity.getCardSeedCount())
			.cardBaseConstructionCost(cardEntity.getCardBaseConstructionCost())
			.cardHeadquartersUsageFee(cardEntity.getCardHeadquartersUsageFee())
			.cardBaseUsageFee(cardEntity.getCardBaseUsageFee())
			.build();
	}
}
