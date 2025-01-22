CREATE SCHEMA IF NOT EXISTS GAME_PROJECT;

-- 스키마 설정
SET SCHEMA GAME_PROJECT;

drop table if exists tbl_user;
-- tbl_user 테이블 생성
CREATE TABLE IF NOT EXISTS tbl_user (
                                        user_id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                                        user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_birthday DATE NOT NULL,
    user_nickname VARCHAR(50) NOT NULL,
    user_profile_picture_url VARCHAR(500),
    user_tier VARCHAR(20),
    user_level INT,
    user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_updated_at TIMESTAMP,
    user_deleted_at TIMESTAMP
    );
INSERT INTO tbl_user (user_name, user_email, user_password, user_birthday, user_nickname,
                      user_profile_picture_url, user_tier, user_level, user_created_at,
                      user_updated_at, user_deleted_at)
VALUES ('dummyUser1', 'dummyUser1@example.com', 'dummyPassword1', '1990-01-01', 'dummyNick1',
        'http://example.com/dummy1.jpg', 'dummyTier1', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        NULL),
       ('dummyUser2', 'dummyUser2@example.com', 'dummyPassword2', '1991-02-02', 'dummyNick2',
        'http://example.com/dummy2.jpg', 'dummyTier2', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        NULL),
       ('dummyUser3', 'dummyUser3@example.com', 'dummyPassword3', '1992-03-03', 'dummyNick3',
        'http://example.com/dummy3.jpg', 'dummyTier3', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        NULL);