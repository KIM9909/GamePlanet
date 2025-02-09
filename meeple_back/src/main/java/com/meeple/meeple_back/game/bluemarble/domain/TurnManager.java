package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.game.bluemarble.controller.socket.response.StartTurnResponse;

import java.util.ArrayDeque;
import java.util.List;
import java.util.Queue;

/**
 * 턴 관리 클래스. 플레이어 순서를 관리하고, 더블 카운트, 현재 라운드를 관리한다.
 */

public class TurnManager {
	private Queue<Player> players;
	private double doubleCount;
	private int round;
	private int turnCount;

	public TurnManager() {
	}

	public TurnManager(Queue<Player> players, double doubleCount, int round, int turnCount) {
		this.players = players;
		this.doubleCount = doubleCount;
		this.round = round;
		this.turnCount = turnCount;
	}

	private TurnManager(Queue<Player> players) {
		this.players = players;
		this.doubleCount = 0;
		this.round = 1;
		this.turnCount = 1;
	}

	public static TurnManager init(List<Player> players) {
		return new TurnManager(new ArrayDeque<>(players));
	}

	public StartTurnResponse startTurn() {
		return StartTurnResponse.from(players.peek(), round, turnCount, checkDoubleState());
	}

	private boolean checkDoubleState() {
		return doubleCount >= 1;
	}

	/**
	 * 턴 끝내기.
	 * 턴 끝내는 조건 확인하고 다음턴 준비하기.
	 */
	public void endTurn() {
		if (players.size() <= 1) {
			return;
		}

		if (rolledDouble()) {
			return;
		}

		doubleCount = 0;

		incrementTurn();

		if (isCurrentPlayerBankrupt()) {
			removeCurrentPlayer();
			return;
		}

		cycleCurrentPlayer();
	}

	private void incrementTurn() {
		turnCount++;
		if (turnCount >= players.size()) {
			turnCount = 1;
			round++;
		}
	}

	private void cycleCurrentPlayer() {
		Player currentPlayer = players.poll();
		players.offer(currentPlayer);
	}

	private void removeCurrentPlayer() {
		players.poll();
	}

	private boolean isCurrentPlayerBankrupt() {
		return players.peek().isBankrupt();
	}

	private boolean rolledDouble() {
		return doubleCount == 1;
	}


	public void checkDouble() {
		this.doubleCount++;

	}
}
