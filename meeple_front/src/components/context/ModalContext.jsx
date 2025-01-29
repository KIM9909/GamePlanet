import React, { createContext, useContext, useState } from "react";

// 모달 컨텍스트 생성
const ModalContext = createContext();

// 컨텍스트를 쉽게 사용할 수 있도록 하는 커스텀 훅
export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isModalOpen, setIsModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}
