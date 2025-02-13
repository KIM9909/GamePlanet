package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
}
