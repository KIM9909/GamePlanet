import React, {useState} from "react";
import ChatView from "./ChatView";
import RuleView from "./RuleView";
import SettingView from "./SettingView";

const GameSidebar = () => {
    const [currentView, setCurrentView] = useState('chat')

    const handleExit = () => {
        console.log('Exit click');
    }

    const renderView = () => {
        switch(currentView) {
            case 'chat':
                return <ChatView />;
            case 'rule':
                return <RuleView />;
            case 'setting':
                return <SettingView />;
            default:
                return <ChatView />
        }
    }

    return (
        <div className="flex flex-col bg-black text-white w-72 h-screen border-r border-gray-700">
          <div className="flex-1 overflow-hidden">
            {renderView()}
          </div>
    
          <div className="grid grid-cols-4 border-t border-gray-700">
            <button 
              className={`py-2 text-center transition-colors text-sm ${currentView === 'chat' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => setCurrentView('chat')}
            >
              CHAT
            </button>
            <button 
              className={`py-2 text-center transition-colors text-sm border-l border-gray-700 ${currentView === 'rule' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => setCurrentView('rule')}
            >
              RULE
            </button>
            <button 
              className={`py-2 text-center transition-colors text-sm border-l border-gray-700 ${currentView === 'setting' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => setCurrentView('setting')}
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
      );
}

export default GameSidebar