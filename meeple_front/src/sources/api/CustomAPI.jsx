import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * 요청 인터셉터를 설정
 * 모든 요청에 Authorization 헤더 자동 추가
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터 설정
 * 응답 데이터 추출 및 에러 처리 통합
 */
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error.response?.data || error);
  }
);

export const CustomAPI = {
  /**
   * Custom Element API
   */
  createElement: async (elementData) => {
    try {
      const formData = new FormData();
      formData.append('customName', elementData.customName);
      formData.append('userId', elementData.userId);
      formData.append('imgFile', new File([elementData.imgFile], 'thumbnail.png', { type: 'image/png' }));
  
      const response = await API.post(
        "/custom-element/create", 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw error || "커스텀 요소 생성에 실패했습니다.";
    }
  },

  getAllElements: async () => {
    try {
      const response = await API.get("/custom-element");
      return response;
    } catch (error) {
      throw error || "커스텀 요소 목록을 불러오는데 실패했습니다.";
    }
  },

  getElementById: async (customId) => {
    try {
      const response = await API.get(`/custom-element/${customId}`);
      return response;
    } catch (error) {
      throw error || "커스텀 요소를 불러오는데 실패했습니다.";
    }
  },

  updateElement: async (customId, elementData) => {
    try {
      const response = await API.put(`/custom-element/${customId}/update`, elementData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      throw error || "커스텀 요소 수정에 실패했습니다.";
    }
  },

  deleteElement: async (customId) => {
    try {
      const response = await API.delete(`/custom-element/${customId}/delete`);
      return response;
    } catch (error) {
      throw error || "커스텀 요소 삭제에 실패했습니다.";
    }
  },

   /**
   * Custom Tile API
   */
   createTile: async (customId, tileData) => {
    try {
      const formData = new FormData();
      
      // Canvas Blob을 파일로 변환
      const tileImage = new File(
        [tileData.tileImage], 
        `tile-${tileData.tileNumber}.png`, 
        { type: 'image/png' }
      );

      // FormData에 필요한 데이터 추가
      formData.append('tileName', tileData.tileName);
      formData.append('tileColor', tileData.tileColor);
      formData.append('tileNumber', tileData.tileNumber);
      formData.append('tileType', tileData.tileType);
      formData.append('tilePrice', tileData.tilePrice);
      formData.append('tileImage', tileImage);

      const response = await API.post(
        `/custom-element/tile/${customId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw error || "커스텀 타일 생성에 실패했습니다.";
    }
  },

  getAllTiles: async (customId) => {
    try {
      const response = await API.get(`/custom-element/tile/${customId}`);
      return response;
    } catch (error) {
      throw error || "커스텀 타일 목록을 불러오는데 실패했습니다.";
    }
  },

  getTileById: async (customId, tileId) => {
    try {
      const response = await API.get(`/custom-element/tile/${customId}/read/${tileId}`);
      return response;
    } catch (error) {
      throw error || "커스텀 타일을 불러오는데 실패했습니다.";
    }
  },

   /**
   * 특정 유저의 커스텀 요소 찾기
   */
   findByUserId: async (userId) => {
    try {
      const response = await API.get(`/custom-element/find-by-user-id/${userId}`);
      return response;
    } catch (error) {
      throw error || "유저의 커스텀 요소를 찾는데 실패했습니다.";
    }
  },

  /**
   * 완성된 타일 목록 조회
   */
  getCompleteTiles: async (customId) => {
    try {
      const response = await API.get(`/custom-element/${customId}/complete-tiles`);
      return response;
    } catch (error) {
      throw error || "완성된 타일 목록을 불러오는데 실패했습니다.";
    }
  },

  updateTile: async (customId, tileId, tileData) => {
    try {
      const formData = new FormData();
      
      // 이미지가 있는 경우에만 파일로 변환
      if (tileData.tileImage) {
        const tileImage = new File(
          [tileData.tileImage], 
          `tile-${tileData.tileNumber}.png`, 
          { type: 'image/png' }
        );
        formData.append('tileImage', tileImage);
      }

      // 나머지 데이터 추가
      Object.keys(tileData).forEach(key => {
        if (key !== 'tileImage' && tileData[key] !== undefined) {
          formData.append(key, tileData[key]);
        }
      });

      const response = await API.put(
        `/custom-element/tile/${customId}/update/${tileId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw error || "커스텀 타일 수정에 실패했습니다.";
    }
  },

  deleteTile: async (customId, tileId) => {
    try {
      const response = await API.delete(`/custom-element/tile/${customId}/delete/${tileId}`);
      return response;
    } catch (error) {
      throw error || "커스텀 타일 삭제에 실패했습니다.";
    }
  },

  /**
   * Custom Card API
   */
  createSeedCard: async (customId, cardData) => {
    try {
      const response = await API.post(`/custom-element/card/${customId}/create-seed-card`, cardData);
      return response;
    } catch (error) {
      throw error || "시드 카드 생성에 실패했습니다.";
    }
  },

  getAllSeedCards: async (customId) => {
    try {
      const response = await API.get(`/custom-element/card/${customId}/read-all-seed-cards`);
      return response;
    } catch (error) {
      throw error || "시드 카드 목록을 불러오는데 실패했습니다.";
    }
  },

  getCardById: async (customId, cardId) => {
    try {
      const response = await API.get(`/custom-element/card/${customId}/read/${cardId}`);
      return response;
    } catch (error) {
      throw error || "카드 정보를 불러오는데 실패했습니다.";
    }
  },

  updateCard: async (customId, cardId, cardData) => {
    try {
      const response = await API.put(`/custom-element/card/${customId}/update/${cardId}`, cardData);
      return response;
    } catch (error) {
      throw error || "카드 수정에 실패했습니다.";
    }
  },

  deleteCard: async (customId, cardId) => {
    try {
      const response = await API.delete(`/custom-element/card/${customId}/delete/${cardId}`);
      return response;
    } catch (error) {
      throw error || "카드 삭제에 실패했습니다.";
    }
  },


  // 찐막막
  createTileCard: async (customId, tileCardData) => {
    try {
      const formData = new FormData();
      
      // 이미지 파일 변환
      const imgFile = new File(
        [tileCardData.imgFile], 
        `tile-card-${tileCardData.number}.png`, 
        { type: 'image/png' }
      );

      // FormData에 필요한 데이터 추가
      formData.append('cardColor', tileCardData.cardColor);
      formData.append('name', tileCardData.name);
      formData.append('seedCount', tileCardData.seedCount);
      formData.append('description', tileCardData.description);
      formData.append('baseConstructionCost', tileCardData.baseConstructionCost);
      formData.append('headquartersUsageFee', tileCardData.headquartersUsageFee);
      formData.append('baseUsageFee', tileCardData.baseUsageFee);
      formData.append('imgFile', imgFile);
      formData.append('number', tileCardData.number);

      const response = await API.post(
        `/custom-element/${customId}/create-tile-card`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw error || "타일 카드 생성에 실패했습니다.";
    }
  },

  getTileImages: async (customId) => {
    try {
      const response = await API.get(`/custom-element/${customId}/tile-images`);
      return response;
    } catch (error) {
      throw error || "타일 이미지 목록을 불러오는데 실패했습니다.";
    }
  },

  updateTileCard: async (customId, tileCardData) => {
    try {
      const formData = new FormData();
      
      // 이미지 파일이 있는 경우에만 변환
      if (tileCardData.imgFile) {
        const imgFile = new File(
          [tileCardData.imgFile], 
          `tile-card-${tileCardData.number}.png`, 
          { type: 'image/png' }
        );
        formData.append('imgFile', imgFile);
      }

      // FormData에 필요한 데이터 추가
      formData.append('cardColor', tileCardData.cardColor);
      formData.append('name', tileCardData.name);
      formData.append('seedCount', tileCardData.seedCount);
      formData.append('description', tileCardData.description);
      formData.append('baseConstructionCost', tileCardData.baseConstructionCost);
      formData.append('headquartersUsageFee', tileCardData.headquartersUsageFee);
      formData.append('baseUsageFee', tileCardData.baseUsageFee);
      formData.append('number', tileCardData.number);

      const response = await API.put(
        `/custom-element/${customId}/update-tile-card`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw error || "타일 카드 수정에 실패했습니다.";
    }
  },

  findTileCardByNumber: async (customId, cardNumber) => {
    try {
      const response = await API.get(`/custom-element/${customId}/find-tile-card/${cardNumber}`);
      return response;
    } catch (error) {
      throw error || "타일 카드를 찾는데 실패했습니다.";
    }
  },
  // 특정 커스텀 ID에 해당하는 타일 삭제
deleteCustomTileByNumber: async (customId, tileNumber) => {
  try {
    const response = await API.delete(`/custom-element/${customId}/delete-tile/${tileNumber}`);
    return response;
  } catch (error) {
    throw error || "타일 삭제에 실패했습니다.";
  }
},
// 상태 업데이트
updateStatus: async (customId, status) => {
  try {
    const response = await API.put(`/custom-element/${customId}/update-status?status=${status}`);
    return response;
  } catch (error) {
    throw error || "상태 업데이트에 실패했습니다.";
  }
},

};

export default CustomAPI;