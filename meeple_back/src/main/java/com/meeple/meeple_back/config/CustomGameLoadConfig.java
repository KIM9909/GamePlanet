package com.meeple.meeple_back.config;

import com.meeple.meeple_back.game.bluemarble.domain.LoadGameElement;
import com.meeple.meeple_back.game.bluemarble.domain.SeedCertificateCard;
import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomCardService;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CustomGameLoadConfig {
	

	@Bean
	public LoadGameElement<SeedCertificateCard> seedCardLoader(
			CustomCardService customCardService) {
		return new LoadGameElement<>() {
			@Override
			public List<SeedCertificateCard> load(Integer customId) {
				return customCardService.findSeedCertificateCardByCustomId(customId);
			}
		};
	}
}
