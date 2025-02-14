package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CardEntity;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CardResponse {
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

	public static CardResponse from(CardEntity cardEntity) {
        return CardResponse.builder()
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
