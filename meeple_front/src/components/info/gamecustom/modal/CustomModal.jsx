import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import CustomAPI from '../../../../sources/api/CustomAPI';
import toast from 'react-hot-toast'; 

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

const CustomModal = ({ onClose, cardId, customId }) => {
  const actualTileNumber = CUSTOMIZABLE_TILES[cardId - 1];
  
  // 공통 state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFD700');
  const [priceColor, setPriceColor] = useState('#FFFFFF');
  const [description, setDescription] = useState('');
  
  // 씨앗은행 카드 추가 state
  const [baseBuildPrice, setBaseBuildPrice] = useState('');
  const [hqPrice, setHqPrice] = useState('');
  const [basePrice, setBasePrice] = useState('');
  
  // 타일 관련 state
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // 타일 이미지 생성
  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 180, 250);
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 180, 80);
    
    if (uploadedImage) {
      setIsImageLoading(true);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 80, 180, 170);
        addText(ctx, 180, 250);
        setIsImageLoading(false);
      };
      img.src = uploadedImage;
    } else {
      addText(ctx, 180, 250);
    }
  };

  const addText = (ctx, width, height) => {
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px DungGeunMo';
    ctx.fillText(name, width / 2, 25);
    
    ctx.font = 'bold 36px DungGeunMo';  
    ctx.fillStyle = priceColor;    
    ctx.fillText(price, width / 2 - 30, 62);
    
    ctx.font = 'bold 18px DungGeunMo';  
    ctx.fillStyle = 'white';       
    ctx.fillText('만마불', width / 2 + 25, 60);
  };



  const rotateAndGetBlob = async () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas || isImageLoading) return null;

    const { rotation, type } = getRotationInfo(actualTileNumber);
    
    // 회전 캔버스 크기 조정
    const rotatedCanvas = document.createElement('canvas');
    if (type === 'vertical') {
      rotatedCanvas.width = 180;
      rotatedCanvas.height = 250;
    } else {
      // 가로형 타일일 때는 크기를 반대로
      rotatedCanvas.width = 250;
      rotatedCanvas.height = 180;
    }
    
    const ctx = rotatedCanvas.getContext('2d');
    ctx.save();
    
    // 회전 중심점 조정
    if (type === 'horizontal') {
      // 가로형 타일의 경우
      ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(sourceCanvas, -125, -125, 250, 250); // 크기 정확히 맞춤
    } else {
      // 세로형 타일의 경우
      ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(sourceCanvas, -90, -125, 180, 250); // 크기 정확히 맞춤
    }
    
    ctx.restore();

    return new Promise(resolve => {
      rotatedCanvas.toBlob(resolve, 'image/png');
    });
};

    const handleSave = async () => {
      if (!name || !price || !description || !baseBuildPrice || !hqPrice || !basePrice) {
        toast.error('모든 필드를 입력해주세요.');
        return;
      }

      try {
        const rotatedBlob = await rotateAndGetBlob();
        if (!rotatedBlob) {
          toast.error('이미지 생성에 실패했습니다.');
          return;
        }

        const tileCardData = {
          name: name,
          cardColor: backgroundColor,
          description: description,
          baseConstructionCost: parseInt(baseBuildPrice),
          headquartersUsageFee: parseInt(hqPrice),
          baseUsageFee: parseInt(basePrice),
          imgFile: rotatedBlob,
          number: actualTileNumber,
          seedCount: parseInt(price),
        };

        // 타일과 카드 생성
        await CustomAPI.createTileCard(customId, tileCardData);
        toast.success('타일과 카드가 성공적으로 생성되었습니다.');
        onClose();  // 모달 닫기
      } catch (error) {
        console.error('타일/카드 생성 에러:', error);
        toast.error(error.message || '타일과 카드 생성에 실패했습니다.');
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

  // 가격 제한 체크 함수
  const handlePriceChange = (value, setter, maxLimit) => {
    const numberValue = Math.min(maxLimit, parseInt(value) || 0);
    setter(numberValue);
  };

  return (
    <div className="bg-slate-800 rounded-lg w-11/12 max-w-6xl h-[90vh] p-6 relative">
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>
      
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">타일/씨앗은행카드 {actualTileNumber} 커스터마이징</h2>

      <div className="grid grid-cols-3 gap-6 h-[calc(100%-100px)]">
        {/* 공통 설정 섹션 */}
        <div className="space-y-6 overflow-y-auto pr-4">
          <h3 className="text-lg font-semibold text-white">공통 설정</h3>
          
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
                onChange={(e) => handlePriceChange(e.target.value, setPrice, 60)}
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
        </div>

        {/* 씨앗은행 카드 설정 섹션 */}
        <div className="space-y-6 overflow-y-auto pr-4">
          <h3 className="text-lg font-semibold text-white">씨앗은행 카드 설정</h3>
          
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <label className="block text-white mb-2">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none resize-none"
              placeholder="카드 설명"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <label className="block text-white mb-2">기지 건설비</label>
              <input
                type="number"
                value={baseBuildPrice}
                onChange={(e) => handlePriceChange(e.target.value, setBaseBuildPrice, 30)}
                min="0"
                max="30"
                className="w-full p-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="최대 30"
              />
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <label className="block text-white mb-2">우주본부 가격</label>
              <input
                type="number"
                value={hqPrice}
                onChange={(e) => handlePriceChange(e.target.value, setHqPrice, 40)}
                min="0"
                max="40"
                className="w-full p-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="최대 40"
              />
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <label className="block text-white mb-2">우주기지 가격</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => handlePriceChange(e.target.value, setBasePrice, 100)}
                min="0"
                max="100"
                className="w-full p-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="최대 100"
              />
            </div>
          </div>
        </div>

        {/* 타일 미리보기 섹션 */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">타일 설정</h3>
          
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

          <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col">
            <h4 className="text-white mb-4">타일 미리보기</h4>
            <div className="flex-1 flex items-center justify-center bg-slate-800/50 rounded-lg p-4">
              <canvas 
                ref={canvasRef}
                width={180}
                height={250}
                className="max-h-[400px] w-auto object-contain" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={onClose}
          className="px-6 py-2 text-white bg-slate-600 hover:bg-slate-700 rounded transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={isImageLoading}
          className={`px-6 py-2 text-white rounded transition-colors ${
            isImageLoading 
              ? 'bg-slate-500 cursor-not-allowed' 
              : 'bg-cyan-500 hover:bg-cyan-600'
          }`}
        >
          {isImageLoading ? '이미지 로딩 중...' : '저장'}
        </button>
      </div>
    </div>
  );
};

export default CustomModal;