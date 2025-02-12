package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementCreate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_game_custom_element")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomElementEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer customId;

	@Column(length = 20)
	private String customName;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public static CustomElementEntity from(CustomElementCreate create) {
		return CustomElementEntity.builder()
			.customName(create.getCustomName())
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();
	}
}
