package com.meeple.meeple_back.gameCustom.bluemarble.controller.response;

import java.util.List;
import lombok.Data;

@Data
public class CustomElementListResponse {
    private int customId;
    private List<Integer> customCompleteList;
}
