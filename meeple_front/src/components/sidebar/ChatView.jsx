import React, { useState } from 'react';

const ChatView = () => {
  const [chatInput, setChatInput] = useState('');
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2 mb-4">
          <div className="bg-gray-800 rounded p-2 max-w-[80%]">
            오빠 내 디자인 별로야?
          <div className="bg-gray-800 rounded p-2 ml-auto mr-4 max-w-[80%]">
          </div>
            오빠 지금 게임중
          </div>
        </div>
      </div>
      <div className="p-2">
        <div className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="채팅을 입력하세요..."
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;