package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.CustomCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomNeuronValleyCardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomSeedcardRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomTelepathyCardRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_card")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer cardId;

	@Column
	private Integer cardNumber;

	@Column(length = 30)
	private String cardName;

	@Column(length = 500)
	private String cardDescription;

	@Column(length = 30)
	private String cardType;

	@Column(length = 20)
	private String cardColor;

	@Column
	private Integer cardSeedCount;

	@Column
	private Integer cardBaseConstructionCost;

	@Column
	private Integer cardHeadquartersUsageFee;

	@Column
	private Integer cardBaseUsageFee;

	public static CardEntity from(CustomSeedcardRequest request) {
		return CardEntity.builder().cardNumber(request.getCardNumber()).cardName(request.getCardName())
				.cardDescription(request.getCardDescription()).cardType(request.getCardType()).cardColor(request.getCardColor())
				.cardSeedCount(request.getCardSeedCount()).cardBaseConstructionCost(request.getCardBaseConstructionCost())
				.cardHeadquartersUsageFee(request.getCardHeadquartersUsageFee()).cardBaseUsageFee(request.getCardBaseUsageFee()).build();
	}

	public static CardEntity fromTelepathyCard(CustomTelepathyCardRequest request) {
		return CardEntity.builder().cardNumber(request.getCardNumber()).cardName(request.getCardName())
				.cardDescription(request.getCardDescription()).cardType(request.getCardType()).build();
	}

	public static CardEntity fromNeuronValleyCard(CustomNeuronValleyCardRequest request) {
		return CardEntity.builder().cardNumber(request.getCardNumber()).cardName(request.getCardName())
				.cardDescription(request.getCardDescription()).cardType(request.getCardType()).build();
	}

	public CardEntity update(CustomCardRequest request) {
		return CardEntity.builder().cardId(this.cardId).cardNumber(this.cardNumber).cardName(request.getCardName())
				.cardDescription(request.getCardDescription()).cardType(this.cardType).cardColor(request.getCardColor())
				.cardSeedCount(this.cardSeedCount).cardBaseConstructionCost(request.getCardBaseConstructionCost())
				.cardHeadquartersUsageFee(request.getCardHeadquartersUsageFee()).cardBaseUsageFee(request.getCardBaseUsageFee()).build();
	}
}