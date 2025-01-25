import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ChatView from "./ChatView";
import RuleView from "./RuleView";
import SettingView from "./SettingView";
import useSocket from "../../hooks/useSocket";
import Galmuri9 from '../../assets/fonts/Galmuri9.ttf';

const GameSidebar = () => {
 const [currentView, setCurrentView] = useState("chat");
 const { roomId } = useParams();
 const { connected, sendMessage, messages } = useSocket(roomId);

 const handleExit = () => {
   console.log("Exit click");
 };

 const renderView = () => {
   switch (currentView) {
     case "chat":
       return (
         <ChatView
           connected={connected}
           sendMessage={sendMessage}
           messages={messages}
         />
       );
     case "rule":
       return <RuleView />;
     case "setting":
       return <SettingView />;
     default:
       return (
         <ChatView
           connected={connected}
           sendMessage={sendMessage}
           messages={messages}
         />
       );
   }
 };

 return (
   <>
     <style>
       {`
         @font-face {
           font-family: 'Galmuri9';
           src: url(${Galmuri9}) format('truetype');
         }
       `}
     </style>
     <div className="flex flex-col bg-black text-white w-72 h-screen border-r border-gray-700" style={{ fontFamily: 'Galmuri9' }}>
       <div className="flex-1 overflow-hidden">{renderView()}</div>

       <div className="grid grid-cols-4 border-t border-gray-700">
         <button
           className={`py-2 text-center transition-colors text-sm ${
             currentView === "chat" ? "bg-gray-800" : "hover:bg-gray-800"
           }`}
           onClick={() => setCurrentView("chat")}
         >
           CHAT
         </button>
         <button
           className={`py-2 text-center transition-colors text-sm border-l border-gray-700 ${
             currentView === "rule" ? "bg-gray-800" : "hover:bg-gray-800"
           }`}
           onClick={() => setCurrentView("rule")}
         >
           RULE
         </button>
         <button
           className={`py-2 text-center transition-colors text-sm border-l border-gray-700 ${
             currentView === "setting" ? "bg-gray-800" : "hover:bg-gray-800"
           }`}
           onClick={() => setCurrentView("setting")}
         >
           SETTING
         </button>
         <button
           className="py-2 text-center transition-colors text-sm border-l border-gray-700 hover:bg-gray-800"
           onClick={handleExit}
         >
           EXIT
         </button>
       </div>
     </div>
   </>
 );
};

export default GameSidebar;