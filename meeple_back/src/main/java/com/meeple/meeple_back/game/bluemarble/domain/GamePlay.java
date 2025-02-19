package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuildBaseResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuyLandResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DrawCardResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.ChoosePositionRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuildBaseRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuyLandRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.CardDrawRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.PayFeeRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.TurnEndRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.ChoosePositionResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.PayFeeResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.TurnEndResponse;
import com.meeple.meeple_back.game.bluemarble.util.ExcelReader;
import com.meeple.meeple_back.game.bluemarble.util.NeuronsValleyParser;
import com.meeple.meeple_back.game.bluemarble.util.SeedCertificateCardParser;
import com.meeple.meeple_back.game.bluemarble.util.TelepathyCardParser;
import com.meeple.meeple_back.game.bluemarble.util.TileParser;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
@Data
public class GamePlay {

	private int gamePlayId;
	private String gameStatus;
	private int round;
	private List<Tile> board;
	private List<Card> cards;
	private TurnManager turnManager;

	public GamePlay() {

	}

	public GamePlay(int gamePlayId, String gameStatus, int round,
			List<Tile> board, List<Card> cards, TurnManager turnManager) {
		this.gamePlayId = gamePlayId;
		this.gameStatus = gameStatus;
		this.round = round;
		this.board = board;
		this.cards = cards;
		this.turnManager = turnManager;
	}

	public static GamePlay init(GamePlayCreate gamePlayCreate, List<Player> players,
			List<Tile> tiles, List<Card> cards) {
		return GamePlay.builder()
				.gamePlayId(gamePlayCreate.getGamePlayId())
				.gameStatus(GameStatus.IN_PROGRESS.getStatus())
				.round(1)
				.board(tiles)
				.cards(cards)
				.turnManager(TurnManager.init(players))
				.build();
	}

	public static GamePlay init(GamePlayCreate gamePlayCreate, List<Player> players) {
		return GamePlay.builder()
				.gamePlayId(gamePlayCreate.getGamePlayId())
				.gameStatus(GameStatus.IN_PROGRESS.getStatus())
				.round(1)
				.board(createTiles())
				.cards(createCards())
				.turnManager(TurnManager.init(players))
				.build();
	}


	private static List<Tile> createTiles() {
		ExcelReader<Tile> tileParser = new TileParser();
		return tileParser.readExcelFile();
	}


	private static List<Card> createCards() {

		ExcelReader<SeedCertificateCard> seedCertificateCardParser = new SeedCertificateCardParser();
		List<SeedCertificateCard> seedCards = seedCertificateCardParser.readExcelFile();
		List<TelepathyCard> telepathyCards = new TelepathyCardParser().readExcelFile();
		List<NeuronsValleyCard> neuronsValleyCards = new NeuronsValleyParser().readExcelFile();
		List<Card> cards = new ArrayList<>();
		cards.addAll(seedCards);
		cards.addAll(telepathyCards);
		cards.addAll(neuronsValleyCards);

		return cards;
	}

	public static GamePlay copyObject(GamePlay gamePlay) {
		return GamePlay.builder()
				.gamePlayId(gamePlay.getGamePlayId())
				.gameStatus(gamePlay.getGameStatus())
				.round(gamePlay.getRound())
				.board(gamePlay.getBoard())
				.cards(gamePlay.getCards())
				.turnManager(gamePlay.getTurnManager())
				.build();
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


	private Player getValidatedPlayer(int playerId) {
		return turnManager.findPlayerById(playerId)
				.orElseThrow(() -> new IllegalArgumentException("Player not found"));
	}

	/**
	 * 더블이면 더블 Count ++
	 */
	private void processDoubleRoll(DiceRollResult response) {
		if (response.isDouble()) {
			turnManager.checkDouble();
		}
	}

	public DiceRollResponse rollDices(DiceRollRequest diceRollRequest) {
		Player currentPlayer = getValidatedPlayer(diceRollRequest.getPlayerId());
		// 주사위 더블일때만 탈출
		boolean isDouble = diceRollRequest.getFirstDice() == diceRollRequest.getSecondDice();

		if (currentPlayer.isTimeTravel()) {
			currentPlayer.setTimeTravel(false);
			if (diceRollRequest.getFirstDice() + diceRollRequest.getSecondDice() >= 4) {
				return DiceRollResponse.from(diceRollRequest.getPlayerId(),
						currentPlayer.getPosition(), currentPlayer.getPosition(),
						diceRollRequest.getFirstDice(), diceRollRequest.getSecondDice(), false,
						ActionType.CHOOSE_POSITION);
			} else {
				currentPlayer.setPosition(currentPlayer.getPosition() + 5);
				return DiceRollResponse.from(diceRollRequest.getPlayerId(),
						currentPlayer.getPosition(), currentPlayer.getPosition() + 5,
						diceRollRequest.getFirstDice(), diceRollRequest.getSecondDice(), false,
						ActionType.CHECK_END);
			}
		}

		if (!isDouble && currentPlayer.getBlackHoleCount() > 0) {
			currentPlayer.decreaseBlackholeCount();
			return DiceRollResponse.from(diceRollRequest.getPlayerId(), currentPlayer.getPosition(),
					currentPlayer.getPosition(), diceRollRequest.getFirstDice(),
					diceRollRequest.getSecondDice(), false, ActionType.CHECK_END);
		} else if (isDouble && currentPlayer.getBlackHoleCount() > 0) {
			currentPlayer.resetBlackholeCount();
		}

		DiceRollResult response = currentPlayer.rollDices(diceRollRequest);
		processDoubleRoll(response);

		int currentPosition = response.getNextPosition();
		ActionType nextAction = processTileEvent(currentPlayer, currentPosition);
		return DiceRollResponse.from(response, nextAction);
	}

	private ActionType processTileEvent(Player currentPlayer, int currentPosition) {
		Tile currentTile = board.stream()
				.filter(tile -> tile.getId() == currentPosition)
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Tile not found"));
		// 행성에 도착할 경우.
		if (TileType.SEED_CERTIFICATE_CARD == currentTile.getType()) {
			return processLandingOnPlanetEvent(currentPlayer, currentTile);
		}
		// TODO 3: 특수카드일 경우 처리
		if (TileType.NEURONS_VALLEY_CARD == currentTile.getType()
				|| TileType.TELEPATHY_CARD == currentTile.getType()) {
			return ActionType.DRAW_CARD;
		}

		if (TileType.BLACK_HOLE == currentTile.getType()) {
			meetBlackhole(currentPlayer);
			return ActionType.CHECK_END;
		}

		if (TileType.TIME_TRAVEL == currentTile.getType()) {
			if (currentPlayer.getBalance() < 300000) {
				return ActionType.CHECK_END;
			}
			currentPlayer.payMoney(300000);
			currentPlayer.setTimeTravel(true);
			turnManager.resetDoubleCount();
			return ActionType.CHOOSE_POSITION;
		}

		return ActionType.CHECK_END;
	}

	private void meetBlackhole(Player currentPlayer) {
		Optional<Tile> tileWillRemove = blackHoleAction(currentPlayer);
		// 플레이어의 완성된 기지중 하나 없앤다.
		tileWillRemove.ifPresent(tile -> {
			tile.update(0, 0);
			currentPlayer.removeCardOwnedByTileId(tile.getId());
		});
		// 플레이어의 블랙홀 카운트를 3으로 설정한다.
		final int REST_TURN_COUNT = 3;
		turnManager.resetDoubleCount();
		currentPlayer.setBlackHoleCount(REST_TURN_COUNT);
	}

	private Optional<Tile> blackHoleAction(Player currentPlayer) {
		for (Tile tile : this.board) {
			if (tile.getOwnerId() == currentPlayer.getPlayerId() && tile.isHasBase()) {
				return Optional.of(tile);
			}
		}
		return Optional.empty();
	}

	/**
	 * 땅에 도착했을 때 이벤트 처리 1. 땅이 비어있으면 구매할지 물어보기 2. 땅이 다른 플레이어 소유이면 통행료 지불 3. 땅이 자신의 땅이면 기지 건설할지 물어보기
	 *
	 * @param currentPlayer - 현재 플레이어
	 * @param currentTile   - 현재 타일
	 *                      <p>
	 *                      return - 다음 액션
	 */
	private ActionType processLandingOnPlanetEvent(Player currentPlayer, Tile currentTile) {
		// 기지 구매할지 물어보도록 액션 추가
		final int EMPTY_TILE_OWNER_NUMBER = 0;

		if (currentTile.getOwnerId() == currentPlayer.getPlayerId() && !currentTile.isHasBase()) {
			return ActionType.DO_YOU_WANT_TO_BUILD_THE_BASE;
		}

		// 땅 살건지 물어보는 액션 추가
		if (currentTile.getOwnerId() == EMPTY_TILE_OWNER_NUMBER
				&& currentPlayer.getBalance() >= currentTile.getPrice()) {
			return ActionType.DO_YOU_WANT_TO_BUY_THE_LAND;
		}

		// 통행료 지불 하도록 액션 추가
		if (currentTile.getOwnerId() != EMPTY_TILE_OWNER_NUMBER
				&& currentTile.getOwnerId() != currentPlayer.getPlayerId()) {
			return ActionType.PAY_TOLL;
		}
		// 턴 끝났는지 확인
		return ActionType.CHECK_END;
	}


	/**
	 * 플레이어가 땅 구매하는 메서드
	 *
	 * @param buyLandRequest - playerid, titleId, action
	 * @return BuyLandResponse - playerId, action, prevMoney, updatedMoney, updatedTile
	 */
	public BuyLandResponse buyLand(BuyLandRequest buyLandRequest) {
		int tileId = buyLandRequest.getTileId();
		Player currentPlayer = getValidatedPlayer(buyLandRequest.getPlayerId());
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
		currentPlayer.addLandOwned(tileId);
		// 플레이어 카드 소유 추가
		currentPlayer.addCardOwned(card);

		return BuyLandResponse.of(currentPlayer.getPlayerId(), prevMoney,
				currentPlayer.getBalance(),
				currentPlayer, tile, ActionType.CHECK_END);
	}


	/**
	 * 타일에 해당하는 카드 뽑기 카드 종류 : 텔레파시, 뉴런의 골짜기, 미완
	 *
	 * @param cardDrawRequest - playerId, tileId
	 * @return DrawCardResponse - playerId, action, card
	 */
	public DrawCardResponse drawCard(CardDrawRequest cardDrawRequest) {

		Player player = getValidatedPlayer(cardDrawRequest.getPlayerId());
		int prevPosition = player.getPosition();
		int prevBalance = player.getBalance();

		Tile tile = findTileById(cardDrawRequest.getTileId());
		TileType tileType = tile.getType();
		Card pickedCard = null; // 뽑은 카드 저장

		if (tileType == TileType.TELEPATHY_CARD) {
			TelepathyCard card = (TelepathyCard) findAndRemoveRandomCardByType(
					CardType.TELEPATHY_CARD);
			pickedCard = card;
			switch (card.getNumber()) {
				case 3:
					int blackHoleIndex = getBlackHoleTileIndex();  // 예: board 내에 type이 "BLACK_HOLE"인 타일의 인덱스를 반환
					player.setPosition(blackHoleIndex);
					meetBlackhole(player);
					break;

				case 7:
					int earthIndex = getEarthTileIndex(); // 예: 지구 타일의 인덱스 (보통 0번)
					player.setPosition(earthIndex);
					player.setBalance(player.getBalance() + 200000);
					break;

				case 10:
					final int FEE_COST = 100000;
					List<Player> allPlayers = turnManager.getAllPlayers(); // 전체 플레이어 목록 반환
					for (Player other : allPlayers) {
						if (other.getPlayerId() != player.getPlayerId()) {
							other.setBalance(other.getBalance() - FEE_COST);
							player.setBalance(player.getBalance() + FEE_COST);
						}
					}
					break;

				case 11:
					player.setBalance(player.getBalance() - 250000);
					int newPos = player.getPosition() - 3;
					int boardSize = getBoardSize();
					if (newPos < 0) {
						newPos += boardSize;
					}
					player.setPosition(newPos);
					break;

				default:
					break;
			}
		}

		if (tileType == TileType.NEURONS_VALLEY_CARD) {
			// 뉴런의 골짜기 카드 뽑기
			NeuronsValleyCard card = (NeuronsValleyCard) findAndRemoveRandomCardByType(
					CardType.NEURONS_VALLEY_CARD);
			pickedCard = card;

			switch (card.getNumber()) {
				case 1:
					final int SATURN_NUMBER = 6;
					player.setPosition(SATURN_NUMBER);
					break;
				case 2:
					final int MOON_NUMBER = 1;
					player.setPosition(MOON_NUMBER);
					break;
				case 12:
					int landDocumentCount = player.getLandOwned().size();
					player.setPosition(prevPosition + landDocumentCount * 2);
					break;
			}
		}
		int nextPosition = player.getPosition();
		int nextBalance = player.getBalance();

		List<Card> updatedCards = getCards();

		return DrawCardResponse.from(
				player.getPlayerId(),
				pickedCard,
				player,
				updatedCards,
				prevPosition,
				nextPosition,
				prevBalance,
				nextBalance,
				ActionType.CHECK_END
		);
	}

	private Card findAndRemoveRandomCardByType(CardType cardType) {
		// 해당 타입의 카드 목록 필터링
		List<Card> filteredCards = cards.stream()
				.filter(c -> c.checkType(cardType))
				.toList();
		// 해당 카드가 없으면 예외 발생
		if (filteredCards.isEmpty()) {
			throw new IllegalArgumentException("Card not found");
		}
		// 무작위 인덱스 선택
		int randomIndex = new Random().nextInt(filteredCards.size());
		return filteredCards.get(randomIndex);
	}

	private int getBoardSize() {
		return this.board.size();
	}


	private int getEarthTileIndex() {
		return 0;
	}

	private int getBlackHoleTileIndex() {
		return 20;
	}

	/**
	 * 기지 건설 ( 땅 도착 -> 자신의 땅 -> 기지 없음 -> 기지 건설)
	 * <p>
	 * 기지 통행료 업데이트, 기지 건설 비용 지불
	 *
	 * @param buildBaseRequest -playerId, tileId
	 * @return BuildBaseResponse - playerId, action, prevMoney, updatedMoney, updatedTile
	 */
	public BuildBaseResponse buildBase(BuildBaseRequest buildBaseRequest) {
		Player player = getValidatedPlayer(buildBaseRequest.getPlayerId());
		Tile tile = findTileById(buildBaseRequest.getTileId());

		if (tile.getOwnerId() != player.getPlayerId()) {
			throw new IllegalArgumentException("Player의 땅이 아닙니다.");
		}

		if (tile.isHasBase()) {
			throw new IllegalArgumentException("이미 기지가 존재합니다");
		}
		SeedCertificateCard card = (SeedCertificateCard) player.getCardOwnedByTileId(
				buildBaseRequest.getTileId());

		int baseBuildFee = card.getBaseConstructionCost();
		int headquarterUsageFee = card.getHeadquartersUsageFee();

		if (player.getBalance() < baseBuildFee) {
			throw new IllegalArgumentException("Player의 자금이 부족합니다");
		}

		int prevPlayerMoney = player.getBalance();
		player.payMoney(baseBuildFee);
		int updatedMoney = player.getBalance();

		tile.addBase();
		tile.updateTollPrice(headquarterUsageFee);

		return BuildBaseResponse.from(player.getPlayerId(), prevPlayerMoney, updatedMoney, player,
				tile, ActionType.CHECK_END);
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

	@Override
	public boolean equals(Object o) {
		if (!(o instanceof GamePlay gamePlay)) {
			return false;
		}
		return getGamePlayId() == gamePlay.getGamePlayId() && getRound() == gamePlay.getRound()
				&& Objects.equals(getGameStatus(), gamePlay.getGameStatus())
				&& Objects.equals(getBoard(), gamePlay.getBoard())
				&& Objects.equals(getCards(), gamePlay.getCards())
				&& Objects.equals(getTurnManager(), gamePlay.getTurnManager());
	}

	@Override
	public int hashCode() {
		return Objects.hash(getGamePlayId(), getGameStatus(), getRound(), getBoard(),
				getCards(), getTurnManager());
	}

	private PayFeeResponse handleInsufficientBalance(Player paidPlayer, Player receivedPlayer,
			int tollPrice) {
		int available = paidPlayer.getBalance();
		int seizureLandIndex = -1;
		int maxSeizurePrice = -1;
		for (int i = 0; i < board.size(); i++) {
			Tile tile = board.get(i);
			if (tile.getOwnerId() != paidPlayer.getPlayerId()) {
				continue;
			}
			maxSeizurePrice = Math.max(maxSeizurePrice, tile.getPrice());
			seizureLandIndex = i;
		}

		if (available + maxSeizurePrice >= tollPrice) {
			Tile mostExpeisiveTile = board.get(seizureLandIndex);
			SeedCertificateCard card = (SeedCertificateCard) paidPlayer.getCardOwnedByTileId(
					mostExpeisiveTile.getId());
			paidPlayer.addMoney(card.getSeedCount());
			cards.add(card);
			paidPlayer.removeCardOwned(card);
			paidPlayer.payMoney(tollPrice);
			receivedPlayer.addMoney(tollPrice);
			mostExpeisiveTile.update(0, 0, card.getSeedCount());
			return PayFeeResponse.from(available, paidPlayer.getBalance(), tollPrice, false,
					paidPlayer, receivedPlayer, ActionType.CHECK_END);
		}
		final int availablePayment = paidPlayer.getBalance();
		final int remainingToll = tollPrice - paidPlayer.getBalance();
		paidPlayer.payMoney(availablePayment);
		receivedPlayer.addMoney(availablePayment);
		paidPlayer.setBroken();

		paidPlayer.getLandOwned().forEach(tileId -> {
			Tile tile = findTileById(tileId);
			tile.update(0, 0, tile.getPrice());
			SeedCertificateCard card = (SeedCertificateCard) paidPlayer.getCardOwnedByTileId(
					tileId);
			cards.add(card);
			paidPlayer.removeCardOwned(card);
		});

		return PayFeeResponse.from(availablePayment, paidPlayer.getBalance(), remainingToll, true,
				paidPlayer, receivedPlayer, ActionType.CHECK_END);
	}

	private PayFeeResponse handleSufficientBalance(Player paidPlayer, Player receivedPlayer,
			int tollPrice) {
		final int previousBalance = paidPlayer.getBalance();

		paidPlayer.payMoney(tollPrice);
		receivedPlayer.addMoney(tollPrice);

		return PayFeeResponse.from(previousBalance, paidPlayer.getBalance(), tollPrice, false,
				paidPlayer, receivedPlayer, ActionType.CHECK_END);
	}

	private void validateTileOwnership(Tile tile, Player payer) {
		if (tile.getOwnerId() == 0) {
			throw new IllegalArgumentException("주인 없는 땅입니다.");
		}
		if (tile.getOwnerId() == payer.getPlayerId()) {
			throw new IllegalArgumentException("플레이어가 땅의 주인입니다.");
		}
	}

	/**
	 * 턴 종료, 게임 종료 조건 확인, 게임 결과 리턴.
	 *
	 * @param turnEndRequest
	 * @return
	 */
	public TurnEndResponse turnEnd(TurnEndRequest turnEndRequest) {
		return turnManager.endTurn(board);
	}


	public ChoosePositionResponse choosePosition(ChoosePositionRequest request) {
		final int EARTH_NUMBER = 0;
		Player player = getValidatedPlayer(request.getPlayerId());
		int prevPosition = player.getPosition();
		turnManager.resetDoubleCount();
		player.setTimeTravel(false);
		player.setPosition(EARTH_NUMBER);
		ActionType actionType = processTileEvent(player, player.getPosition());
		return new ChoosePositionResponse(player.getPlayerId(), prevPosition, player.getPosition(),
				actionType.getAction());
	}
}