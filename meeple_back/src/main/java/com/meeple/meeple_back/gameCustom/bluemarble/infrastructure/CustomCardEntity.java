package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 3. CustomCardEntity Entity
@Entity
@Table(name = "tbl_custom_card")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomCardEntity {

	@EmbeddedId
	private CustomCardId id;

	@ManyToOne
	@MapsId("customId")
	@JoinColumn(name = "custom_id")
	private CustomElementEntity customElement;

	@ManyToOne
	@MapsId("cardId")
	@JoinColumn(name = "card_id")
	private CardEntity card;
}