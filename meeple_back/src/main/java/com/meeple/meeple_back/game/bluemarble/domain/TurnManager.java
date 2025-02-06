package com.meeple.meeple_back.game.bluemarble.domain;

import java.util.Queue;

public class TurnManager {

	private final Queue<ActionType> turnActionQueue;

	public TurnManager(Queue<ActionType> turnActionQueue) {
		this.turnActionQueue = turnActionQueue;
	}

	public void addTurnAction(ActionType turnAction) {
		turnActionQueue.add(turnAction);
	}

	public ActionType executeTurn() {
		if (turnActionQueue.isEmpty()) {
			throw new IllegalStateException("No turn action to execute");
		}
		return turnActionQueue.poll();
	}

	public ActionType peekTurn() {
		if (turnActionQueue.isEmpty()) {
			throw new IllegalStateException("No turn action to peek");
		}
		return turnActionQueue.peek();
	}

	public boolean hasNextTurn() {
		return !turnActionQueue.isEmpty();
	}

	public void reset() {
		turnActionQueue.clear();
	}
}
