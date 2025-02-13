package com.meeple.meeple_back.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenViduConfig {

	@Value("${openvidu.url}")
	private String OPENVIDU_URL;
	@Value("${openvidu.secret}")
	private String SECRET;

	public String getOpenviduUrl() {
		return OPENVIDU_URL;
	}

	public String getSecret() {
		return SECRET;
	}

	@PostConstruct
	public void init() {
		// SSL 인증서 검증 비활성화 (개발 환경에서만 사용)
		System.setProperty("javax.net.ssl.trustStore", "");
		System.setProperty("javax.net.ssl.trustStorePassword", "");
		System.setProperty("javax.net.ssl.trustStoreType", "JKS");
		System.setProperty("javax.net.debug", "ssl,handshake"); // SSL 디버깅 활성화

		// OpenVidu 서버 설정
		System.setProperty("OPENVIDU_URL", getOpenviduUrl());
		System.setProperty("OPENVIDU_SECRET", getSecret());
	}
}