import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import CustomAPI from '../../../../sources/api/CustomAPI';
import toast from 'react-hot-toast'; 
import DeleteConfirmModal from './DeleteConfirmModal';

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

const CustomModal = ({ onClose, cardId, customId, onSuccess, isEdit }) => {
  const actualTileNumber = CUSTOMIZABLE_TILES[cardId - 1];
  
  // 색상 팔레트 정의
  const colorPalette = [
    { name: '빨강', color: '#FF0000' },
    { name: '주황', color: '#FFA500' },
    { name: '노랑', color: '#FFFF00' },
    { name: '초록', color: '#008000' },
    { name: '파랑', color: '#0000FF' },
    { name: '남색', color: '#000080' },
    { name: '보라', color: '#800080' }
  ];

  // 공통 state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFD700');
  const [priceColor, setPriceColor] = useState('#FFFFFF');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 씨앗은행 카드 추가 state
  const [baseBuildPrice, setBaseBuildPrice] = useState('');
  const [hqPrice, setHqPrice] = useState('');
  const [basePrice, setBasePrice] = useState('');
  
  // 타일 관련 state
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

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
    
    const rotatedCanvas = document.createElement('canvas');
    if (type === 'vertical') {
      rotatedCanvas.width = 180;
      rotatedCanvas.height = 250;
    } else {
      rotatedCanvas.width = 250;
      rotatedCanvas.height = 180;
    }
    
    const ctx = rotatedCanvas.getContext('2d');
    ctx.save();
    
    if (type === 'horizontal') {
      ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(sourceCanvas, -125, -125, 250, 250);
    } else {
      ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(sourceCanvas, -90, -125, 180, 250);
    }
    
    ctx.restore();

    return new Promise(resolve => {
      rotatedCanvas.toBlob(resolve, 'image/png');
    });
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await CustomAPI.deleteCustomTileByNumber(customId, actualTileNumber);
      onSuccess();
      onClose();
    } catch (error) {
      return error
    }
  };

  const handleSave = async () => {
    if (!name || !price || !description || !baseBuildPrice || !hqPrice || !basePrice) {
      return;
    }

    try {
      const imageToSend = isEdit && !uploadedImage ? null : await rotateAndGetBlob();
      
      const tileCardData = {
        name: name,
        cardColor: backgroundColor,
        description: description,
        baseConstructionCost: parseInt(baseBuildPrice)*10000 ,
        headquartersUsageFee: parseInt(hqPrice)*10000,
        baseUsageFee: parseInt(basePrice)*10000,
        imgFile: imageToSend,
        number: actualTileNumber,
        seedCount: parseInt(price)*10000,
      };
      

      let response;
      if (isEdit) {
        response = await CustomAPI.updateTileCard(customId, tileCardData);
        toast.success('타일과 카드가 성공적으로 수정되었습니다.');
      } else {
        if (!imageToSend) {
          toast.error('이미지를 업로드해주세요.');
          return;
        }
        response = await CustomAPI.createTileCard(customId, tileCardData);
        toast.success('타일과 카드가 성공적으로 생성되었습니다.');
      }
      
      onSuccess(response);
    } catch (error) {
      toast.error(error.message || '타일과 카드 처리에 실패했습니다.');
    }
  };

  useEffect(() => {
    const loadExistingData = async () => {
      if (isEdit) {
        try {
          setIsLoading(true);
          const response = await CustomAPI.findTileCardByNumber(customId, actualTileNumber);
          
          if (response) {
            setName(response.card.cardName);
            setPrice((response.card.cardSeedCount/10000).toString());
            setBackgroundColor(response.card.cardColor);
            setDescription(response.card.cardDescription);
            setBaseBuildPrice((response.card.cardBaseConstructionCost/10000).toString());
            setHqPrice((response.card.cardHeadquartersUsageFee/10000).toString());
            setBasePrice((response.card.cardBaseUsageFee/10000).toString());
            
            if (response.tile.tileImageUrl) {
              setExistingImage(response.tile.tileImageUrl);
            }
          }
        } catch (error) {
          toast.error('데이터 로딩에 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [isEdit, customId, actualTileNumber]);

  const renderImagePreview = () => {
    if (isEdit && !uploadedImage) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-800/50 rounded-lg p-4">
          <div className="relative w-full h-full">
            <img 
              src={existingImage} 
              alt="Current tile" 
              className="max-h-[400px] w-auto object-contain mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-sm">새 이미지를 업로드하여 수정할 수 있습니다</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-800/50 rounded-lg p-4">
          <canvas 
            ref={canvasRef}
            width={180}
            height={250}
            className="max-h-[400px] w-auto object-contain" 
          />
        </div>
      );
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
      
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">
        타일/씨앗은행카드 {actualTileNumber} {isEdit ? '수정' : '생성'}
      </h2>

      <div className="grid grid-cols-3 gap-6 h-[calc(100%-100px)]">
        {/* 공통 설정 섹션 */}
        <div className="space-y-6 overflow-y-auto pr-4">
          <h3 className="text-lg font-semibold text-white">공통 설정</h3>
          
          {/* 색상 선택 섹션 */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white">상단 색상</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="inline-flex gap-2 mt-2">
              {colorPalette.map(({ name, color }) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className="group relative h-8"
                >
                  <div
                    className={`w-8 h-8 border-2 ${
                      backgroundColor === color ? 'border-white' : 'border-transparent'
                    } hover:border-white transition-colors`}
                    style={{ backgroundColor: color }}
                  />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap
                                  bg-slate-900 text-white text-xs px-2 py-1 rounded-md
                                  opacity-0 group-hover:opacity-100 transition-opacity
                                  pointer-events-none">
                    {name}
                  </span>
                </button>
              ))}
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

          <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white mb-4">타일 미리보기</h4>
        {renderImagePreview()}
      </div>
        </div>
      </div>

        {/* 저장 버튼 */}
        <div className="mt-6 flex justify-end gap-4">
          <div className="flex gap-4">
            {isEdit && (
              <button
                onClick={handleDelete}
                className="px-6 py-2 text-white bg-slate-500 hover:bg-red-600 rounded transition-colors"
              >
                초기화
              </button>
            )}
            <button 
              onClick={handleSave} 
              className="px-6 py-2 text-white bg-slate-500 hover:bg-cyan-600 rounded"
            >
              {isEdit ? '수정' : '저장'}
            </button>
          </div>
        </div>
        {showDeleteConfirm && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="타일 초기화"
          targetName={`${actualTileNumber}번 타일`}
          message="를 초기화하면 복구할 수 없습니다. 계속하시겠습니까?"
          confirmButtonText="초기화"
        />
      )}
    </div>
  );
};
export default CustomModal;