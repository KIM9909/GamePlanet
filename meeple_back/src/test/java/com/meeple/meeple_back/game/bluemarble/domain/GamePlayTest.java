package com.meeple.meeple_back.game.bluemarble.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.meeple.meeple_back.game.bluemarble.controller.socket.request.PayFeeRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.PayFeeResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class GamePlayTest {

	private GamePlay gamePlay;
	private Player paidPlayer;
	private Player receivedPlayer;
	private Tile tollTile;

	@BeforeEach
	public void setUp() {
		// paidPlayer: 잔액이 50, 소유한 땅은 없음 (즉, seizure 가격이 반영되지 않음)
		paidPlayer = Player.builder()
				.playerId(1)
				.playerName("Player 1")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		paidPlayer.setBalance(50);
		// receivedPlayer: 잔액은 크게 설정 (예: 1000)
		receivedPlayer = Player.builder()
				.playerId(2)
				.playerName("Player 2")
				.position(0)
				.balance(500000)
				.cardOwned(new HashSet<>())
				.landOwned(new ArrayList<>())
				.timeTravel(false)
				.blackHoleCount(0)
				.build();
		receivedPlayer.setBalance(1000);

		// tollTile: 소유자는 receivedPlayer, tollPrice는 100
		tollTile = Tile.builder()
				.id(1)
				.name("통행료 타일")
				.ownerId(0)
				.tollPrice(0)
				.hasBase(false)
				.type(TileType.SEED_CERTIFICATE_CARD)
				.imageUrl("test-image-url")
				.price(100)
				.build();
		tollTile.setOwnerId(receivedPlayer.getPlayerId());
		tollTile.setTollPrice(100);

		// board 구성: tollTile 하나만 포함 (paidPlayer는 아무 타일도 소유하지 않음)
		List<Tile> board = new ArrayList<>();
		board.add(tollTile);

		// GamePlay 인스턴스 생성 및 초기화
		gamePlay = new GamePlay();
		gamePlay.setBoard(board);

		gamePlay.getTurnManager().setPlayers(Arrays.asList(paidPlayer, receivedPlayer));
		gamePlay.setCards(new ArrayList<>());  // 카드 목록 (비어있는 상태)

		// 그 외 필요한 초기화 (예: gameStatus, round 등)
		gamePlay.setRound(1);
	}

	/**
	 * 시나리오: paidPlayer의 잔액(50)이 tollPrice(100)보다 작고, 소유한 땅이 없어 seizure를 통한 보충이 불가능한 경우, payFee 호출 시
	 * paidPlayer가 파산 처리되어야 한다.
	 */
	@Test
	public void testPayFee_InsufficientBalance_TriggersBankruptcy() {
		// Arrange: PayFeeRequest 생성
		PayFeeRequest request = new PayFeeRequest();
		request.setTileId(tollTile.getId());
		request.setPlayerId(paidPlayer.getPlayerId());

		// Act: payFee 메서드 호출
		PayFeeResponse response = gamePlay.payFee(request);

		// Assert:
		// 1. PayFeeResponse의 bankruptcy 플래그가 true이어야 함.
		assertTrue(response.isPlayerBrokenState(), "잔액 부족 상황에서 bankruptcy 플래그가 true여야 합니다.");

		// 2. paidPlayer가 파산 상태로 변경되었는지 확인 (예: isBroken() 혹은 isBankrupt() 사용)
		assertTrue(paidPlayer.isBankrupt(), "paidPlayer는 파산 상태로 표시되어야 합니다.");

		// 3. paidPlayer의 잔액은 0이 되어야 함 (payMoney 호출로 모두 지불)
		assertEquals(-1, paidPlayer.getBalance(), "paidPlayer의 잔액은 0이어야 합니다.");

		// 4. receivedPlayer는 paidPlayer가 가진 잔액(50)만큼 증가했는지 확인
		// (테스트 목적상 초기 receivedPlayer 잔액은 1000이었으므로, 최종 잔액은 1050이어야 함)
		assertEquals(1050, receivedPlayer.getBalance(), "receivedPlayer의 잔액이 올바르게 증가해야 합니다.");

		// 추가 검증: paidPlayer가 소유한 땅 관련 로직 처리 (만약 paidPlayer가 소유한 타일이 없으므로, 별도 검증은 생략)
	}
}