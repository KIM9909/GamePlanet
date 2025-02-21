package com.meeple.meeple_back.game.bluemarble.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.meeple.meeple_back.game.bluemarble.controller.socket.response.TurnEndResponse;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class TurnManagerTest {

	private TurnManager turnManager;
	private List<Tile> board;

	@BeforeEach
	public void setUp() {
		turnManager = new TurnManager();

		board = new ArrayList<>();
		board.add(Tile.builder()
				.id(1)
				.name("시드니")
				.ownerId(1)
				.tollPrice(50000)
				.hasBase(false)
				.type(TileType.SEED_CERTIFICATE_CARD)
				.imageUrl("sydney.png")
				.price(200000)
				.build());
		board.add(Tile.builder()
				.id(2)
				.name("도쿄")
				.ownerId(2)
				.tollPrice(60000)
				.hasBase(false)
				.type(TileType.SEED_CERTIFICATE_CARD)
				.imageUrl("tokyo.png")
				.price(250000)
				.build());
	}

	/**
	 * 시나리오 1: 초기 플레이어 2명에서 현재 플레이어가 파산한 경우 -> 파산 처리 후 플레이어 리스트의 크기가 1이 되어 checkWinnerByPlayerSize()
	 * 조건 충족 → gameEnd 응답 반환
	 */
	@Test
	public void testEndTurn_PlayerBankrupt_GameEnds() {
		// Arrange: 플레이어 2명 구성, 초기 플레이어 수 = 2, currentPlayerIndex = 0
		List<Player> players = new ArrayList<>();
		Player player1 = Player.builder()
				.playerId(1)
				.playerName("Player 1")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		Player player2 = Player.builder()
				.playerId(2)
				.playerName("Player 2")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		players.add(player1);
		players.add(player2);
		turnManager.setPlayers(players);
		turnManager.setInitialPlayerCount(2);
		turnManager.setCurrentPlayerIndex(0);
		turnManager.setRound(1);
		turnManager.setDoubleCount(0);

		player1.setBroken();

		// Act: endTurn 호출
		TurnEndResponse response = turnManager.endTurn(board);

		// Assert: 파산 처리 후 players 리스트의 크기는 1이 되어 gameEnd 응답이 나와야 함
		assertEquals("GAME_END", response.getNextAction());
		assertNotNull(response.getWinner(), "게임 종료 응답에는 승리 플레이어가 설정되어야 합니다.");
		assertEquals(2, response.getWinner().getPlayerId(), "남은 플레이어(player2)가 승리해야 합니다.");
		assertEquals(1, turnManager.getPlayers().size());
	}

	/**
	 * 시나리오 2: 초기 플레이어 3명에서 현재 플레이어가 파산한 경우 -> 파산 처리 후 플레이어 리스트의 크기가 2이면, gameEnd 조건은 충족되지 않으므로 다음
	 * 턴(nextTurn) 응답 반환
	 */
	@Test
	public void testEndTurn_PlayerBankrupt_NextTurn() {
		// Arrange: 플레이어 3명 구성, 초기 플레이어 수 = 3, currentPlayerIndex = 0
		List<Player> players = new ArrayList<>();
		Player player1 = Player.builder()
				.playerId(1)
				.playerName("Player 1")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		Player player2 = Player.builder()
				.playerId(2)
				.playerName("Player 2")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		Player player3 = Player.builder()
				.playerId(2)
				.playerName("Player 3")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		players.add(player1);
		players.add(player2);
		players.add(player3);
		turnManager.setPlayers(players);
		turnManager.setInitialPlayerCount(3);
		turnManager.setCurrentPlayerIndex(0);
		turnManager.setRound(1);
		turnManager.setDoubleCount(0);

		// 현재 플레이어(player1)를 파산 상태로 설정
		player1.setBroken();

		// Act: endTurn 호출
		TurnEndResponse response = turnManager.endTurn(board);

		// Assert: 초기 3명에서 한 명 제거 후 2명이 남으므로 gameEnd 조건(<=1)이 충족되지 않아 nextTurn 응답이어야 함
		assertEquals("START_TURN", response.getNextAction());
		assertNotNull(response.getRemovedPlayer(), "파산 처리된 플레이어 정보가 응답에 포함되어야 합니다.");
		assertEquals(1, response.getRemovedPlayer().getPlayerId(), "제거된 플레이어는 player1이어야 합니다.");
		assertNotNull(response.getNextPlayer(), "다음 턴 플레이어 정보가 응답에 포함되어야 합니다.");
		assertEquals(2, response.getNextPlayer().getPlayerId(), "다음플레이어는 2이어야 합니다.");
		assertEquals(2, turnManager.getPlayers().size());
	}

	/**
	 * 시나리오 2: 땅을 소유한 플레이어가 파산한 경우 -> 파산 처리 후 소유한 땅의 ownerId가 0으로 변경되어야 함
	 */
	@Test
	public void testEndTurn_PlayerWithLandBankrupt() {
		// Arrange: 플레이어 2명 구성, player1이 시드니를 소유
		List<Player> players = new ArrayList<>();
		Player player1 = Player.builder()
				.playerId(1)
				.playerName("Player 1")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		Player player2 = Player.builder()
				.playerId(2)
				.playerName("Player 2")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();

		// player1이 시드니를 소유하도록 설정
		board.get(0).setOwnerId(player1.getPlayerId());
		player1.getLandOwned().add(0);

		players.add(player1);
		players.add(player2);
		turnManager.setPlayers(players);
		turnManager.setInitialPlayerCount(2);
		turnManager.setCurrentPlayerIndex(0);
		turnManager.setRound(1);
		turnManager.setDoubleCount(0);

		// player1을 파산 상태로 설정
		player1.setBroken();

		// Act: endTurn 호출
		TurnEndResponse response = turnManager.endTurn(board);

		// Assert
		assertEquals("GAME_END", response.getNextAction());
		assertEquals(0, board.get(0).getOwnerId(), "파산한 플레이어의 땅은 소유자가 없어야 합니다.");
//		assertTrue(player1.getLandOwned().isEmpty(), "파산한 플레이어의 소유 땅 목록이 비어있어야 합니다.");
		assertEquals(2, response.getWinner().getPlayerId(), "남은 플레이어(player2)가 승리해야 합니다.");
		assertEquals(1, turnManager.getPlayers().size());
	}

	/**
	 * 시나리오 4: 더블이 발생한 상황에서 플레이어가 파산한 경우 -> 파산 처리가 우선되어야 하며, 더블 상태는 무시되어야 함
	 */
	@Test
	public void testEndTurn_PlayerBankruptWithDouble() {
		// Arrange: 플레이어 2명 구성
		List<Player> players = new ArrayList<>();
		Player player1 = Player.builder()
				.playerId(1)
				.playerName("Player 1")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		Player player2 = Player.builder()
				.playerId(2)
				.playerName("Player 2")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();

		players.add(player1);
		players.add(player2);
		turnManager.setPlayers(players);
		turnManager.setInitialPlayerCount(2);
		turnManager.setCurrentPlayerIndex(0);
		turnManager.setRound(1);

		// 더블 상태 설정
		turnManager.checkDouble();

		// player1을 파산 상태로 설정
		player1.setBroken();

		// Act: endTurn 호출
		TurnEndResponse response = turnManager.endTurn(board);

		// Assert: 파산이 우선되어 게임이 종료되어야 함
		assertEquals("GAME_END", response.getNextAction());
		assertNotNull(response.getWinner());
		assertEquals(2, response.getWinner().getPlayerId());
		assertEquals(1, turnManager.getPlayers().size());
		assertEquals(0, turnManager.getDoubleCount(), "파산 처리 후 더블 카운트는 리셋되어야 함");
	}
}