package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomElementListResponse {
    private int customId;
    private List<Integer> customCompleteList;
}
