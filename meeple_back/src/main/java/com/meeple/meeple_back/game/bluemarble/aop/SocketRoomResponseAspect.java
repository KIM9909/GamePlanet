package com.meeple.meeple_back.game.bluemarble.aop;

import com.meeple.meeple_back.game.bluemarble.controller.response.SocketRoomResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementEntity;
import com.meeple.meeple_back.gameCustom.bluemarble.infrastructure.CustomElementJpaRepository;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomElementService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class SocketRoomResponseAspect {

	private final CustomElementService customElementService;

	@Around("execution(* com.meeple.meeple_back.game.bluemarble.controller.socket.*.*(..))")
	public Object addCustomIds(ProceedingJoinPoint joinPoint) throws Throwable {
		Object result = joinPoint.proceed();

		if (result instanceof SocketRoomResponse) {
			SocketRoomResponse response = (SocketRoomResponse) result;
			List<CustomElementResponse> customElements = customElementService.findCustomElementsOnlyCompleted();
			response.setCustomElementResponses(customElements);
		}

		return result;
	}
}
