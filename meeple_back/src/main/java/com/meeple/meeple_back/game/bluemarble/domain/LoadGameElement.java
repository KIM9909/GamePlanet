package com.meeple.meeple_back.game.bluemarble.domain;

import java.util.List;

public interface LoadGameElement<T> {
	List<T> load(Integer customId);
}
