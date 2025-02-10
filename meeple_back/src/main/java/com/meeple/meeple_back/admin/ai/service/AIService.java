package com.meeple.meeple_back.admin.ai.service;

import com.meeple.meeple_back.admin.ai.model.request.RequestLogin;
import com.meeple.meeple_back.admin.ai.model.response.ResponseLogin;

public interface AIService {
    ResponseLogin login(RequestLogin request);
}
