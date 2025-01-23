CREATE SCHEMA IF NOT EXISTS GAME_PROJECT;

-- 스키마 설정
SET SCHEMA GAME_PROJECT;

drop table if exists tbl_user;
-- tbl_user 테이블 생성
CREATE TABLE IF NOT EXISTS tbl_user
(
    user_id                  BIGINT       NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_name                VARCHAR(100) NOT NULL,
    user_email               VARCHAR(255) NOT NULL UNIQUE,
    user_password            VARCHAR(255) NOT NULL,
    user_birthday            DATE         NOT NULL,
    user_nickname            VARCHAR(50)  NOT NULL,
    user_profile_picture_url VARCHAR(500),
    user_tier                VARCHAR(20),
    user_level               INT,
    user_created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_updated_at          TIMESTAMP,
    user_deleted_at          TIMESTAMP
);

