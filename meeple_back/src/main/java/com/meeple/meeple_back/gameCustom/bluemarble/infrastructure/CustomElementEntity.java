package com.meeple.meeple_back.gameCustom.bluemarble.infrastructure;

import com.meeple.meeple_back.gameCustom.bluemarble.controller.request.CustomElementRequest;
import com.meeple.meeple_back.gameCustom.bluemarble.controller.response.CustomElementResponse;
import com.meeple.meeple_back.gameCustom.bluemarble.domain.CustomElementCreate;
import com.meeple.meeple_back.user.model.User;
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

	@Column(name = "custom_name", length = 20)
	private String customName;
	@Column(name = "created_at")
	private LocalDateTime createdAt;
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;


	public static CustomElementEntity from(CustomElementRequest request) {
		return CustomElementEntity.builder()
			.customName(request.getCustomName())
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();
	}

	public static CustomElementResponse to(CustomElementEntity customElementEntity){
		return CustomElementResponse.builder()
			.customId(customElementEntity.getCustomId())
			.customName(customElementEntity.getCustomName())
			.createdAt(customElementEntity.getCreatedAt())
			.updatedAt(customElementEntity.getUpdatedAt())
			.build();
	}

	public void update(CustomElementRequest customElementRequest) {
		this.customName = customElementRequest.getCustomName();
		this.updatedAt = LocalDateTime.now();
	}
}
