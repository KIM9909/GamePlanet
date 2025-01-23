import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import useSocket from '../hooks/useSocket';

const GameRoom = () => {
  const { roomId } = useParams();
  const [message, setMessage] = useState('');
  const { connected, sendMessage, startGame } = useSocket(roomId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <Container>
      <GameStatus>
        <Status $connected={connected}>
          {connected ? '연결됨' : '연결 중...'}
        </Status>
        <StartButton onClick={startGame}>
          게임 시작
        </StartButton>
      </GameStatus>

      <ChatSection>
        <ChatBox>
          {/* 채팅 메시지들 */}
        </ChatBox>
        <ChatForm onSubmit={handleSendMessage}>
          <ChatInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <SendButton type="submit">전송</SendButton>
        </ChatForm>
      </ChatSection>

      <GameSection>
        {/* 게임 관련 UI */}
      </GameSection>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const GameStatus = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Status = styled.span`
  color: ${props => props.$connected ? 'green' : 'orange'};
  font-weight: bold;
`;

const StartButton = styled.button`
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const ChatSection = styled.div`
  margin-bottom: 20px;
`;

const ChatBox = styled.div`
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  margin-bottom: 10px;
`;

const ChatForm = styled.form`
  display: flex;
  gap: 10px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #1976D2;
  }
`;

const GameSection = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  min-height: 400px;
`;

export default GameRoom; 