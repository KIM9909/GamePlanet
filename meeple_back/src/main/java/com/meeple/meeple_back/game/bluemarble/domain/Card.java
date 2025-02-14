package com.meeple.meeple_back.game.bluemarble.domain;

import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public abstract class Card {

	private int id;
	private int number;
	private String name;
	private CardType type;
	private String description;

	public Card() {

	}

	public boolean checkType(CardType type) {
		if (Objects.isNull(this.type)) {
			return false;
		}

		return this.type == type;
	}

	@Override
	public boolean equals(Object o) {
		if (!(o instanceof Card card)) {
			return false;
		}
		return getId() == card.getId() && getNumber() == card.getNumber() && Objects.equals(
				getName(), card.getName()) && getType() == card.getType() && Objects.equals(
				getDescription(), card.getDescription());
	}

	@Override
	public int hashCode() {
		return Objects.hash(getId(), getNumber(), getName(), getType(), getDescription());
	}
}
