package com.meeple.meeple_back.game.bluemarble.domain;

import com.meeple.meeple_back.gameCustom.bluemarble.service.CustomCardService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SeedCardLoader implements LoadGameElement<SeedCertificateCard> {

	private CustomCardService customCardService;

	@Autowired
	public void setCustomCardService(CustomCardService customCardService) {
		this.customCardService = customCardService;
	}

	@Override
	public List<SeedCertificateCard> load(Integer customId) {
		return customCardService.findSeedCertificateCardByCustomId(customId);
	}
}
