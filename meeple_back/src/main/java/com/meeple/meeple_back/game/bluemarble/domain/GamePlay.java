package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuyLandResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuyLandRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
					i,
					i,// id
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

	private Card findAndRemoveCardByNumberAndType(int cardNumber, CardType cardType) {
		Card card = cards.stream()
				.filter(c -> c.getNumber() == cardNumber && c.checkType(cardType))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Card not found"));
		cards.remove(card);
		return card;
	}

	private static List<Tile> createTiles() {
		List<Tile> tiles = new ArrayList<>();

		for (int i = 1; i <= 40; i++) {
			Tile tile = new Tile(
					i,                                        // id
					"Tile " + i,                              // name
					0,                                        // owner (0은 미소유)
					i * 50,                                   // toll (예시로 i에 따라 증가)
					false,                                    // hasBase (기본값: 없음)
					TileType.SEED_CERTIFICATE_CARD,
					"image:url",                                   // price (예시로 i에 따라 증가),
					100 + i * 10
			);
			tiles.add(tile);
		}
		return tiles;
	}

	private Optional<Player> findPlayerById(int playerId) {
		return players.stream()
				.filter(player -> player.getPlayerId() == playerId)
				.findFirst();
	}

	public DiceRollResponse rollDices(DiceRollRequest diceRollRequest) {
		Player currentPlayer = findPlayerById(diceRollRequest.getPlayerId())
				.orElseThrow(() -> new IllegalArgumentException("Player not found"));
		return currentPlayer.rollDices(diceRollRequest);
	}

	/**
	 * 플레이어가 땅 구매하는 메서드
	 *
	 * @param buyLandRequest - playerid, titleId, action
	 * @return BuyLandResponse - playerId, action, prevMoney, updatedMoney, updatedTile
	 */
	public BuyLandResponse buyLand(BuyLandRequest buyLandRequest) {
		int tileId = buyLandRequest.getTileId();
		Player player = findPlayerById(buyLandRequest.getPlayerId())
				.orElseThrow(() -> new IllegalArgumentException("Player not found"));
		Tile tile = board.stream()
				.filter(t -> t.getId() == tileId)
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Tile not found"));

		if (tile.getOwnerId() != 0) {
			throw new IllegalArgumentException("Tile already owned");
		}

		if (tile.getType() != TileType.SEED_CERTIFICATE_CARD) {
			throw new IllegalArgumentException("Tile is not a seed certificate card");
		}

		//현재 플레이어 찾기
		Player currentPlayer = findPlayerById(buyLandRequest.getPlayerId())
				.orElseThrow(() -> new IllegalArgumentException("Player not found"));
		// 원래 금액
		int prevMoney = currentPlayer.getBalance();

		// 플레이어 땅 금액 지불
		currentPlayer.payMoney(tile.getPrice());

		// 카드 덱에서 카드 찾고 제거
		SeedCertificateCard card = (SeedCertificateCard) findAndRemoveCardByNumberAndType(tileId,
				CardType.SEED_CERTIFICATE_CARD);

		// 타일 정보 업데이트
		tile.update(currentPlayer.getPlayerId(), card.getBaseUsageFee(),
				card.getBaseConstructionCost());

		// 플레이어 땅 소유 추가
		player.addLandOwned(tileId);
		// 플레이어 카드 소유 추가
		player.addCardOwned(card);

		return BuyLandResponse.builder().playerId(currentPlayer.getPlayerId())
				.action(buyLandRequest.getAction())
				.prevMoney(prevMoney)
				.updatedMoney(currentPlayer.getBalance())
				.updatedTile(tile)
				.build();
	}
}