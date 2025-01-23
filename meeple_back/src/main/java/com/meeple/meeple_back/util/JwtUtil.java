package com.meeple.meeple_back.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

	private final int validity = 1000 * 60 * 60 * 4; // 4시간

	@Value("${jwt.secret}")
	private String SECRET_KEY;

	private final RedisTemplate<String, String> redisTemplate;

	public JwtUtil(@Qualifier("redisTemplate") RedisTemplate<String, String> redisTemplate) {
		this.redisTemplate = redisTemplate;
	}

	/**
	 * [JWT 생성 메서드] - 사용자명을 클레임에 넣고, 만료 시간 등을 설정해 토큰을 생성한다.
	 */
	public String generateToken(String userEmail) {
		long now = System.currentTimeMillis();

		Key key = getSigningKey();

		return Jwts.builder()
				.setSubject(userEmail)
				.setIssuedAt(new Date(now)) // 발급 시간
				.setExpiration(new Date(now + validity)) // 만료 시간
				.signWith(key, SignatureAlgorithm.HS256) // 서명
				.compact();
	}

	/**
	 * [JWT 검증 메서드] - parseClaimsJws 메서드로 서명 및 만료 시간 등을 검증한다.
	 */
	public boolean validateToken(String token) {
		try {
			if (isTokenBlacklisted(token)) {
				return false;
			}
			Jwts.parserBuilder()
					.setSigningKey(getSigningKey())
					.build()
					.parseClaimsJws(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	/**
	 * [사용자명 추출] - 토큰에서 subject(여기서는 username)를 꺼낸다.
	 */
	public String getUsernameFromToken(String token) {
		Claims claims = Jwts.parserBuilder()
				.setSigningKey(getSigningKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
		return claims.getSubject();
	}

	/**
	 * [Key 객체 생성 메서드] - 비밀 키를 디코딩하고 Key 객체로 변환.
	 */
	private Key getSigningKey() {
		byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
		return Keys.hmacShaKeyFor(keyBytes);
	}

	public void blacklistToken(String token) {
		redisTemplate.opsForValue()
				.set(token, "true", validity, TimeUnit.MILLISECONDS);
	}

	public boolean isTokenBlacklisted(String token) {
		return redisTemplate.hasKey(token);
	}
}
