package com.meeple.meeple_back.game.bluemarble.controller.socket;

import com.meeple.meeple_back.game.bluemarble.controller.port.BluemarbleGameService;
import com.meeple.meeple_back.game.bluemarble.controller.request.DiceRollRequest;
import com.meeple.meeple_back.game.bluemarble.controller.response.BuildBaseResponse;
import com.meeple.meeple_back.game.bluemarble.controller.response.DrawCardResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuildBaseRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.BuyLandRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.CardDrawRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.request.PayFeeRequest;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.SocketBuyLandResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.SocketDiceRollResponse;
import com.meeple.meeple_back.game.bluemarble.controller.socket.response.SocketResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
@Tag(name = "게임플레이(블루마블)")
@Builder
@RequiredArgsConstructor
@MessageMapping("/game/blue-marble/game-plays")
public class BluemarbleGameController {

	private final SimpMessageSendingOperations messagingTemplate;
	private final BluemarbleGameService bluemarbleGameService;

	@MessageMapping("/{roomId}/roll-dice")
	@Operation(summary = "주사위 굴리기", description = "주사위를 굴립니다.")
	public void rollDice(@DestinationVariable("roomId") int roomId,
			@Payload DiceRollRequest diceRollRequest) {
		SocketDiceRollResponse socketDiceRollResponse = SocketDiceRollResponse.from("roll-dice",
				bluemarbleGameService.rollDice(roomId, diceRollRequest), "주사위를 굴렸습니다.");
		messagingTemplate.convertAndSend("/topic/room/" + roomId, socketDiceRollResponse);
	}

	@MessageMapping("/{roomId}/buy-land")
	@Operation(summary = "땅 구매", description = "땅을 구매합니다.")
	public void buyLand(@DestinationVariable("roomId") int roomId,
			@Payload BuyLandRequest buyLandRequest) {
		SocketBuyLandResponse socketBuyLandResponse = SocketBuyLandResponse.from("buy-land",
				bluemarbleGameService.buyLand(roomId, buyLandRequest), "땅을 구매했습니다.");
		messagingTemplate.convertAndSend("/topic/room/" + roomId, socketBuyLandResponse);
	}

	@MessageMapping("/{roomId}/draw-card")
	@Operation(summary = "카드 뽑기", description = "카드를 뽑습니다.")
	public void drawCard(@DestinationVariable("roomId") int roomId,
			@Payload CardDrawRequest cardDrawRequest) {
		// TODO : 카드 뽑기 구현
		SocketResponse<DrawCardResponse> socketCardDrawResponse = SocketResponse.from("draw-card",
				bluemarbleGameService.drawCard(roomId, cardDrawRequest), "카드를 뽑았습니다.");
		messagingTemplate.convertAndSend("/topic/room/" + roomId, socketCardDrawResponse);
	}

	@MessageMapping("/{roomId}/build-base")
	@Operation(summary = "기지 건설", description = "기지를 건설합니다.")
	public void buildBase(@DestinationVariable("roomId") int roomId,
			@Payload BuildBaseRequest buildBaseRequest) {
		SocketResponse<BuildBaseResponse> socketBuildBaseResponse = SocketResponse.from(
				"build-base",
				bluemarbleGameService.buildBase(roomId, buildBaseRequest), "기지를 건설했습니다.");
		messagingTemplate.convertAndSend("/topic/room/" + roomId, socketBuildBaseResponse);

	}

	/**
	 * 통행료 지불 하는 기능
	 *
	 * @param roomId
	 * @param payFeeRequest - playerId, tileId
	 */
	@MessageMapping("/{roomId}/pay-fee")
	@Operation(summary = "통행료 지불", description = "통행료를 지불합니다")
	public void payFee(@DestinationVariable("roomId") int roomId,
			@Payload PayFeeRequest payFeeRequest) {
		SocketResponse<PayFeeResponse> response = SocketResponse.from("pay-fee",
				bluemarbleGameService.payFee(roomId, payFeeRequest), "통행료를 지불했습니다.");
	}
}
