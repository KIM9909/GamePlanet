package com.meeple.meeple_back.friend.model.entity;

import com.meeple.meeple_back.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_friend_message")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FriendMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "friend_message_id")
    private int friendMessageId;

    @Column(name = "friend_message_content")
    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;
}
