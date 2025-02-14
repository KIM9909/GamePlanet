import axios from "axios";

/**
 * Axios 인스턴스 생성 및 기본 설정
 * baseURL: API 서버의 기본 URL
 * withCredentials: 쿠키를 포함한 인증 요청 허용
 */
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

export const AdminAPI = {
  /**
   * 신고 등록 API
   * @param {Object} reportData - 신고 정보 (신고 사유, 제목, 내용, 신고대상 ID, 신고자 ID)
   * @returns {Promise<Object>} 신고 등록 결과
   */
  createReport: async (reportData) => {
    try {
      const response = await API.post("/report", reportData);
      return response;
    } catch (error) {
      throw error || "신고 등록에 실패했습니다.";
    }
  },

  /**
   * 신고 목록 조회 API
   * @returns {Promise<Array>} 신고 목록
   */
  getReportList: async () => {
    try {
      const response = await API.get("/report");
      return response;
    } catch (error) {
      throw error || "신고 목록을 불러오는데 실패했습니다.";
    }
  },

  /**
   * 신고 상세 조회 API
   * @param {number} reportId - 조회할 신고 ID
   * @returns {Promise<Object>} 신고 상세 정보
   */
  getReport: async (reportId) => {
    try {
      const response = await API.get(`/report/${reportId}`);
      return response;
    } catch (error) {
      throw error || "신고 상세 정보를 불러오는데 실패했습니다.";
    }
  },

  /**
   * 신고 처리 API
   * @param {Object} processData - 처리할 신고 정보 (신고 ID, 처리 결과)
   * @returns {Promise<Object>} 처리 결과
   */
  processReport: async (processData) => {
    try {
      const response = await API.post("/report/process-report", processData);
      return response;
    } catch (error) {
      throw error || "신고 처리에 실패했습니다.";
    }
  },

  /**
   * 신고 처리 수정 API
   * @param {Object} updateData - 수정할 처리 정보 (처리 ID, 새로운 처리 결과)
   * @returns {Promise<Object>} 수정 결과
   */
  updateReportProcess: async (updateData) => {
    try {
      const response = await API.put("/report/update-process", updateData);
      return response;
    } catch (error) {
      throw error || "신고 처리 수정에 실패했습니다.";
    }
  },
   /**
   * 음성 로그 생성 API
   * @param {File} audio - 음성 파일
   * @param {string} convertResult - 음성 변환 결과
   * @param {string} userNickname - 사용자 닉네임
   * @returns {Promise<Object>} 음성 로그 생성 결과
   */
   createVoiceLog: async (audio, convertResult, userNickname) => {
    try {
      const formData = new FormData();
      formData.append('audio', audio);
      formData.append('voiceLog', convertResult);
      formData.append('userNickname', userNickname);

      const response = await API.post("/ai/voice-log", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error || "음성 로그 생성에 실패했습니다.";
    }
  },

  /**
   * 음성 로그 목록 조회 API
   * @returns {Promise<Object>} 음성 로그 목록
   */
  getVoiceLogList: async () => {
    try {
      const response = await API.get("/ai/voice-log");
      return response;
    } catch (error) {
      throw error || "음성 로그 목록을 불러오는데 실패했습니다.";
    }
  },

  /**
   * 음성 로그 상세 조회 API
   * @param {number} voiceLogId - 조회할 음성 로그 ID
   * @returns {Promise<Object>} 음성 로그 상세 정보
   */
  getVoiceLog: async (voiceLogId) => {
    try {
      const response = await API.get(`/ai/voice-log/${voiceLogId}`);
      return response;
    } catch (error) {
      throw error || "음성 로그 상세 정보를 불러오는데 실패했습니다.";
    }
  },

  /**
   * 음성 로그 처리 API
   * @param {Object} processData - 처리할 음성 로그 정보
   * @returns {Promise<Object>} 처리 결과
   */
  processVoiceLog: async (processData) => {
    try {
      const response = await API.put("/ai/voice-log", processData);
      return response;
    } catch (error) {
      throw error || "음성 로그 처리에 실패했습니다.";
    }
  },

/**
 * 회원 전체 목록 조회 API
 * @returns {Promise<Array>} 회원 목록
 */
getUserList: async () => {
  try {
    const response = await API.get("/profile");
    return response;
  } catch (error) {
    throw error || "회원 목록을 불러오는데 실패했습니다.";
  }
},

/**
 * 회원 프로필 수정 API
 * @param {number} userId - 수정할 회원 ID
 * @param {Object} userUpdateData - 수정할 회원 정보 (userInfo, userProfilePicture)
 * @returns {Promise<Object>} 수정된 회원 프로필 정보
 */
updateUserProfile: async (userId, userUpdateData) => {
  try {
    const formData = new FormData();
    
    // userInfo JSON을 Blob으로 변환하여 추가
    const userInfo = {
      userName: userUpdateData.userName,
      userNickname: userUpdateData.userNickname,
      userBio: userUpdateData.userBio
    };
    
    formData.append('userInfo', new Blob([JSON.stringify(userInfo)], {
      type: 'application/json'
    }));
    
    // 프로필 이미지가 있으면 추가
    if (userUpdateData.profileImage) {
      formData.append('userProfilePicture', userUpdateData.profileImage);
    }

    const response = await API.put(`/profile/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error || "회원 프로필 수정에 실패했습니다.";
  }
},

/**
 * 회원 탈퇴 API
 * @param {number} userId - 탈퇴할 회원 ID
 * @param {string} password - 회원 탈퇴를 위한 비밀번호
 * @returns {Promise<void>} 탈퇴 처리 결과
 */
deleteUser: async (userId, password) => {
  try {
    const response = await API.delete(`/profile/${userId}/delete`, {
      data: { password },  // data 객체 안에 password를 넣어서 전송
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    throw error || "회원 탈퇴에 실패했습니다.";
  }
}
};


export default AdminAPI;