package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuildBaseResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuyLandResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DrawCardResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.PayFeeResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuildBaseRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuyLandRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.CardDrawRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.PayFeeRequest;
import java.util.ArrayDeque;
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
	private TurnManager turnManager;

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
				.turnManager(new TurnManager(new ArrayDeque<>()))
				.build();
	}

	// TODO : 턴 시작 구현하기
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

	/**
	 * 특정 카드 번호, card Type으로 카드 찾아서 추가
	 *
	 * @param cardNumber 카드 번호
	 * @param cardType   카드 타입 (SEED_CERTIFICATE_CARD, TELEPATHY_CARD, NEURONS_VALLEY_CARD)
	 * @return Card
	 */
	private Card findAndRemoveCardByNumberAndType(int cardNumber, CardType cardType) {
		Card card = cards.stream()
				.filter(c -> c.getNumber() == cardNumber && c.checkType(cardType))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Card not found"));
		cards.remove(card);
		return card;
	}

	private Tile findTileById(int tileId) {
		return board.stream()
				.filter(tile -> tile.getId() == tileId)
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Tile not found"));
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

	private Player getValidatedPlayer(int playerId) {
		return findPlayerById(playerId)
				.orElseThrow(() -> new IllegalArgumentException("Player not found"));
	}

	/**
	 * 더블이면 주사위 한번더 던지기
	 *
	 * @param response
	 */
	private void processDoubleRoll(DiceRollResult response) {
		if (response.isDouble()) {
			turnManager.addTurnAction(ActionType.ROLL_DICE);
		}
	}

	public DiceRollResponse rollDices(DiceRollRequest diceRollRequest) {
		// turnManager.executeTurn();
		Player currentPlayer = getValidatedPlayer(diceRollRequest.getPlayerId());
		DiceRollResult response = currentPlayer.rollDices(diceRollRequest);
		// 더블인 경우 주사위 한번더 던지기
		processDoubleRoll(response);

		// 주사위 굴려서 도착한 땅에 따라서 이벤트 추가
		int currentPosition = response.getNextPosition();
		processTileEvent(currentPlayer, currentPosition);
		DiceRollResponse diceRollResponse = DiceRollResponse.from(response, ActionType.BUY_LAND);
		// 땅에 도착했을 때 이벤트 추가
		return diceRollResponse;
	}

	private void processTileEvent(Player currentPlayer, int currentPosition) {
		Tile currentTile = board.stream()
				.filter(tile -> tile.getId() == currentPosition)
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Tile not found"));
		// 행성에 도착할 경우.
		if (TileType.SEED_CERTIFICATE_CARD == currentTile.getType()) {
			processLandingOnPlanetEvent(currentPlayer, currentTile);
		}
		// TODO: 특수카드일 경우 처리
		if (TileType.NEURONS_VALLEY_CARD == currentTile.getType()) {

		}
	}

	/**
	 * 땅에 도착했을 때 이벤트 처리 1. 땅이 비어있으면 구매할지 물어보기 2. 땅이 다른 플레이어 소유이면 통행료 지불
	 *
	 * @param currentPlayer - 현재 플레이어
	 * @param currentTile   - 현재 타일
	 */
	private void processLandingOnPlanetEvent(Player currentPlayer, Tile currentTile) {
		// 땅 구매할지 물어보도록 액션 추가
		if (currentTile.getOwnerId() == 0 && currentPlayer.getBalance() >= currentTile.getPrice()) {
			turnManager.addTurnAction(ActionType.BUY_LAND);
		}
		// 통행료 지불 하도록 액션 추가
		if (currentTile.getOwnerId() != 0
				&& currentTile.getOwnerId() != currentPlayer.getPlayerId()) {
			turnManager.addTurnAction(ActionType.PAY_TOLL);
		}
	}

	/**
	 * 플레이어가 땅 구매하는 메서드
	 *
	 * @param buyLandRequest - playerid, titleId, action
	 * @return BuyLandResponse - playerId, action, prevMoney, updatedMoney, updatedTile
	 */
	public BuyLandResponse buyLand(BuyLandRequest buyLandRequest) {
//		turnManager.executeTurn();
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
		ActionType nextAction = getNextTurn();

		return BuyLandResponse.of(player.getPlayerId(), ActionType.BUY_LAND.getAction(), prevMoney,
				currentPlayer.getBalance(), tile, nextAction);
	}

	private ActionType getNextTurn() {
		if (turnManager.hasNextTurn()) {
			return turnManager.peekTurn();
		} else {
			return ActionType.END;
		}
	}

	/**
	 * 타일에 해당하는 카드 뽑기 카드 종류 : 텔레파시, 뉴런의 골짜기, 미완
	 *
	 * @param cardDrawRequest - playerId, tileId
	 * @return DrawCardResponse - playerId, action, card
	 */
	public DrawCardResponse drawCard(CardDrawRequest cardDrawRequest) {
		turnManager.executeTurn();

		Player player = getValidatedPlayer(cardDrawRequest.getPlayerId());

		Tile tile = findTileById(cardDrawRequest.getTileId());

		// 카드 뽑아오기
		Card card = findAndRemoveCardByNumberAndType(tile.getId(),
				CardType.valueOf(tile.getType().name()));

		player.addCardOwned(card);
		turnManager.addTurnAction(ActionType.USE_CARD);
		return DrawCardResponse.from(player.getPlayerId(), player, card, getNextTurn());
	}

	/**
	 * 기지 건설 ( 땅 도착 -> 자신의 땅 -> 기지 없음 -> 기지 건설)
	 *
	 * @param buildBaseRequest -playerId, tileId
	 * @return BuildBaseResponse - playerId, action, prevMoney, updatedMoney, updatedTile
	 */
	public BuildBaseResponse buildBase(BuildBaseRequest buildBaseRequest) {
		turnManager.executeTurn();
		Player player = getValidatedPlayer(buildBaseRequest.getPlayerId());
		Tile tile = findTileById(buildBaseRequest.getTileId());

		if (tile.getOwnerId() != player.getPlayerId()) {
			throw new IllegalArgumentException("Player의 땅이 아닙니다.");
		}

		if (tile.isHasBase()) {
			throw new IllegalArgumentException("이미 기지가 존재합니다");
		}
		int baseBuildFee = this.cards.stream()
				.filter(card -> card.getNumber() == buildBaseRequest.getTileId()
						&& card instanceof SeedCertificateCard)
				.mapToInt(card -> ((SeedCertificateCard) card).getBaseConstructionCost())
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("해당 타일 번호와 일치하는 Seed 카드가 없습니다."));

		if (player.getBalance() < baseBuildFee) {
			throw new IllegalArgumentException("Player의 자금이 부족합니다");
		}

		int prevPlayerMoney = player.getBalance();
		player.payMoney(baseBuildFee);
		int updatedMoney = player.getBalance();

		tile.addBase();
		int priceToIncrease = this.cards.stream()
				.filter(card -> card.getNumber() == buildBaseRequest.getTileId()
						&& card instanceof SeedCertificateCard)
				.mapToInt(card -> ((SeedCertificateCard) card).getHeadquartersUsageFee())
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("해당 타일 번호와 일치하는 Seed 카드가 없습니다."));
		tile.increateTollPrice(priceToIncrease);
		ActionType nextTurn = getNextTurn();

		return BuildBaseResponse.from(player.getPlayerId(), nextTurn,
				prevPlayerMoney, updatedMoney, tile);

	}

	/**
	 * 통행료 지불 하는 기능 ( 상대방 타일에 도착, 플레이어 자금이 충분하면 통행료 지불, 없으면 파산?
	 *
	 * @param payFeeRequest - playerId, tileId
	 * @return PayFeeResponse - private int prevMoney; private int updatedMoney; private int
	 * tollPrice; private boolean playerBrokenState; private Player paidPlayer; private Player
	 * receivedPlayer; private String nextAction;
	 */
	public PayFeeResponse payFee(PayFeeRequest payFeeRequest) {
		turnManager.executeTurn();

		Tile tile = findTileById(payFeeRequest.getTileId());
		Player paidPlayer = getValidatedPlayer(payFeeRequest.getPlayerId());
		validateTileOwnership(tile, paidPlayer);
		Player receivedPlayer = getValidatedPlayer(tile.getOwnerId());

		int tollPrice = tile.getTollPrice();

		if (tollPrice > paidPlayer.getBalance()) {
			return handleInsufficientBalance(paidPlayer, receivedPlayer, tollPrice);
		} else {
			return handleSufficientBalance(paidPlayer, receivedPlayer, tollPrice);
		}
	}

	private PayFeeResponse handleInsufficientBalance(Player paidPlayer, Player receivedPlayer,
			int tollPrice) {
		final int availablePayment = paidPlayer.getBalance();
		final int remainingToll = tollPrice - paidPlayer.getBalance();
		paidPlayer.payMoney(availablePayment);
		receivedPlayer.addMoney(availablePayment);
		turnManager.addTurnAction(ActionType.BROKEN);
		return PayFeeResponse.from(availablePayment, paidPlayer.getBalance(), remainingToll, true,
				paidPlayer, receivedPlayer, ActionType.BROKEN);
	}

	private PayFeeResponse handleSufficientBalance(Player paidPlayer, Player receivedPlayer,
			int tollPrice) {
		final int previousBalance = paidPlayer.getBalance();

		paidPlayer.payMoney(tollPrice);
		receivedPlayer.addMoney(tollPrice);

		ActionType nextAction = getNextTurn();

		return PayFeeResponse.from(previousBalance, paidPlayer.getBalance(), tollPrice, false,
				paidPlayer, receivedPlayer, nextAction);
	}

	private void validateTileOwnership(Tile tile, Player payer) {
		if (tile.getOwnerId() == 0) {
			throw new IllegalArgumentException("주인 없는 땅입니다.");
		}
		if (tile.getOwnerId() == payer.getPlayerId()) {
			throw new IllegalArgumentException("플레이어가 땅의 주인입니다.");
		}
	}
}