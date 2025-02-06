package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GamePlay {

	private final int gamePlayId;
	private int currentPlayerIndex;
	private List<Player> players;
	private String gameStatus;
	private int round;
	private List<Tile> board;
	private List<Card> cards;

	@Builder
	public static GamePlay from(GamePlayCreate gamePlayCreate, List<Player> players) {
		return GamePlay.builder()
				.gamePlayId(gamePlayCreate.getGamePlayId())
				.currentPlayerIndex(0)
				.players(players)
				.gameStatus(GameStatus.IN_PROGRESS.getStatus())
				.round(1)
				.board(createTiles())
				.cards(createCards())
				.build();
	}

	private static List<Card> createCards() {
		List<Card> cards = new ArrayList<>();

		// 37개의 예시 데이터를 for문을 통해 생성하여 ArrayList에 추가
		for (int i = 1; i <= 37; i++) {
			SeedCertificateCard card = new SeedCertificateCard(
					i,                                             // id
					"Seed Certificate Card " + i,                  // name
					"Color" + (i % 5 + 1),
					// cardColor (예: Color1 ~ Color5)
					i * 10,
					// seedCount (예시: 10, 20, 30, ...)
					"This is a description for card number " + i,  // description
					100 + i * 10,
					// baseConstructionCost (예: 110, 120, 130, ...)
					50 + i * 5,
					// headquartersUsageFee (예: 55, 60, 65, ...)
					20 + i * 2
					// baseUsageFee (예: 22, 24, 26, ...)
			);
			cards.add(card);
		}

		return cards;
	}

	private static List<Tile> createTiles() {
		List<Tile> tiles = new ArrayList<>();

		for (int i = 1; i <= 40; i++) {
			Tile tile = new Tile(
					i,                                        // id
					"Tile " + i,                              // name
					0,                                        // owner (0은 미소유)
					i * 5,                                    // toll (예시로 i에 따라 증가)
					false,                                    // hasBase (기본값: 없음)
					TileType.SEED_CERTIFICATE_CARD,
					// type (항상 TileType.SEED_CERTIFICATE_CARD)
					i * 50,                                   // price (예시로 i에 따라 증가)
					"http://example.com/images/tile" + i + ".png" // imageUrl
			);
			tiles.add(tile);
		}
		return tiles;
	}

	public Player getCurrentPlayer() {
		return this.getPlayers().stream()
				.filter(player -> player.getPlayerId() == currentPlayerIndex)
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Player not found"));
	}

	public DiceRollResponse rollDices(DiceRollRequest diceRollRequest) {
		return getCurrentPlayer().rollDices(diceRollRequest);
	}
}