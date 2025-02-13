import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { CustomAPI } from '../../../../sources/api/CustomAPI';

const CUSTOMIZABLE_TILES = [1, 3, 4, 5, 6, 8, 9, 11, 12, 14, 16, 18, 19, 21, 22, 24, 25, 26, 27, 28, 31, 32, 34, 36, 38, 39];

const getRotationInfo = (tileNumber) => {
  if ([1, 2, 3, 4, 5, 6, 7, 8, 9].includes(tileNumber)) {
    return { rotation: 180, type: 'vertical', width: 180, height: 250 };
  }
  if ([11, 12, 13, 14, 15, 16, 17, 18, 19].includes(tileNumber)) {
    return { rotation: 270, type: 'horizontal', width: 250, height: 180 };
  }
  if ([20, 21, 22, 23, 24, 25, 26, 27, 28, 29].includes(tileNumber)) {
    return { rotation: 0, type: 'vertical', width: 180, height: 250 };
  }
  if ([31, 32, 33, 34, 35, 36, 37, 38, 39].includes(tileNumber)) {
    return { rotation: 90, type: 'horizontal', width: 250, height: 180 };
  }
  return { rotation: 0, type: 'vertical', width: 180, height: 250 };
};

const TileModal = ({ onClose, cardId, customId }) => {
  const actualTileNumber = CUSTOMIZABLE_TILES[cardId - 1];
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFD700');
  const [priceColor, setPriceColor] = useState('#FFFFFF');
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // 기본 캔버스 생성 (모든 타일 250x180으로 통일)
  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Canvas 초기화 (180x250으로 수정)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 180, 250);
    
    // 상단 색상 영역
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 180, 80); // 상단 1/3 영역
    
    if (uploadedImage) {
      setIsImageLoading(true);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 80, 180, 170); // 하단 2/3 영역
        addText(ctx, 180, 250);
        setIsImageLoading(false);
      };
      img.src = uploadedImage;
    } else {
      addText(ctx, 180, 250);
    }}

  const addText = (ctx, width, height) => {
    if (!ctx) return;
    
    // 이름 텍스트
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px DungGeunMo';
    ctx.fillText(name, width / 2, 25);
    
    // 가격 텍스트
    ctx.font = 'bold 36px DungGeunMo';  
    ctx.fillStyle = priceColor;    
    ctx.fillText(price, width / 2 - 30, 62);
    
    ctx.font = 'bold 18px DungGeunMo';  
    ctx.fillStyle = 'white';       
    ctx.fillText('만마불', width / 2 + 25, 60);
  };

  // 회전 후 저장
  const rotateAndSaveImage = async () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas || isImageLoading) return;

    const { rotation, type } = getRotationInfo(actualTileNumber);
    
    // 새 캔버스 생성 (회전용)
    const rotatedCanvas = document.createElement('canvas');
    rotatedCanvas.width = type === 'vertical' ? 180 : 250;
    rotatedCanvas.height = type === 'vertical' ? 250 : 180;
    const ctx = rotatedCanvas.getContext('2d');

    // 회전 처리
    ctx.save();
    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // 원본 이미지 그리기
    const drawWidth = 250;
    const drawHeight = 180;
    ctx.drawImage(sourceCanvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    
    ctx.restore();

    try {
      // 회전된 이미지를 Blob으로 변환
      const blob = await new Promise(resolve => {
        rotatedCanvas.toBlob(resolve, 'image/png');
      });

      // CustomAPI를 사용하여 서버로 전송
      await CustomAPI.createTile(customId, {
        tileName: name,
        tileColor: backgroundColor,
        tileType:'City',
        tileNumber: cardId,
        tilePrice: price,
        tileImageUrl: blob
      });

      onClose();
    } catch (error) {
      console.error('타일 저장 실패:', error);
      console.log(name, backgroundColor, cardId, price)

      alert('타일 저장에 실패했습니다.');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      generateImage();
    }
  }, [name, price, backgroundColor, priceColor, uploadedImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg w-11/12 max-w-4xl h-[80vh] p-6 relative">
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>
      
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">타일 {actualTileNumber} 커스터마이징</h2>

      <div className="grid grid-cols-2 gap-6 h-[calc(100%-100px)]">
        <div className="space-y-6 overflow-y-auto pr-4">
          {/* 입력 필드들... */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-white">상단 색상</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <label className="block text-white mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= 20) {
                  setName(newValue);
                }
              }}
              maxLength={20}
              className="w-full p-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none"
              placeholder="이름을 입력해주세요 (최대 20자)"
            />
            <div className="text-right mt-1">
              <span className={`text-sm ${name.length === 20 ? 'text-yellow-400' : 'text-slate-400'}`}>
                {name.length} / 20자
              </span>
            </div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <label className="block text-white mb-2">가격</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  const value = Math.min(60, parseInt(e.target.value) || 0);
                  setPrice(value);
                }}
                min="0"   
                max="60" 
                className="flex-1 p-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="최대 60"
              />
              <input
                type="color"
                value={priceColor}
                onChange={(e) => setPriceColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white">타일 이미지</label>
              <span className="text-sm text-cyan-400">180 x 250 픽셀</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 bg-slate-600 text-white rounded file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
            />
          </div>
        </div>

        <div className="h-full flex flex-col">
          <h3 className="text-lg text-white mb-2">미리보기</h3>
          <div className="flex-1 bg-slate-700/50 rounded-lg p-4 flex items-center justify-center">
            <canvas 
              ref={canvasRef}
              width={180}
              height={250}
              className="max-h-[400px] w-auto object-contain" 
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={rotateAndSaveImage}
              disabled={isImageLoading}
              className={`px-4 py-2 text-white rounded transition-colors ${
                isImageLoading 
                  ? 'bg-slate-500 cursor-not-allowed' 
                  : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
            >
              {isImageLoading ? '이미지 로딩 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TileModal;