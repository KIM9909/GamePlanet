import React from 'react';
import { Volume2, Mic, Camera } from 'lucide-react';

const SettingView = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Volume2 size={20} />
          <span className="text-sm">VOLUME</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Mic size={20} />
          <span className="text-sm">MIKE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              min="0"
              max="100"
            />
          </div>
          <button className="px-3 py-1 bg-gray-700 rounded text-sm">ON</button>
          <button className="px-3 py-1 bg-gray-700 rounded text-sm">OFF</button>
        </div>
        <select className="w-full bg-gray-700 text-sm p-2 rounded mt-2">
          <option>마이크 선택</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Camera size={20} />
          <span className="text-sm">CAMERA</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-3 py-1 bg-gray-700 rounded text-sm">ON</button>
          <button className="px-3 py-1 bg-gray-700 rounded text-sm">OFF</button>
        </div>
        <select className="w-full bg-gray-700 text-sm p-2 rounded mt-2">
          <option>카메라 선택</option>
        </select>
      </div>
    </div>
  );
};

export default SettingView;