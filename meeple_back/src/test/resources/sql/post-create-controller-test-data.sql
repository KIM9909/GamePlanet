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