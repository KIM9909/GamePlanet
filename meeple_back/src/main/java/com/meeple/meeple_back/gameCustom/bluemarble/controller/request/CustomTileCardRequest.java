package com.meeple.meeple_back.gameCustom.bluemarble.controller.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomTileCardRequest {
    private final String cardColor;
    private String name;
    private final int seedCount;

    private String description;
    private final int baseConstructionCost;
    private final int headquartersUsageFee;
    private final int baseUsageFee;
    private final String imageUrl;
    private final int number;
    @JsonCreator
    public CustomTileCardRequest(
        @JsonProperty("cardColor") String cardColor,
        @JsonProperty("name") String name,
        @JsonProperty("seedCount") int seedCount,
        @JsonProperty("description") String description,
        @JsonProperty("baseConstructionCost") int baseConstructionCost,
        @JsonProperty("headquartersUsageFee") int headquartersUsageFee,
        @JsonProperty("baseUsageFee") int baseUsageFee, String imageUrl, int number) {
        this.cardColor = cardColor;
        this.name = name;
        this.seedCount = seedCount;
        this.description = description;
        this.baseConstructionCost = baseConstructionCost;
        this.headquartersUsageFee = headquartersUsageFee;
        this.baseUsageFee = baseUsageFee;
        this.imageUrl = imageUrl;
        this.number = number;
    }
}