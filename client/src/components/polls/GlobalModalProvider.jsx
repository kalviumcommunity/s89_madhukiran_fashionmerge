import React, { createContext, useState, useContext } from 'react';
import CommentModal from './CommentModal';

// Create a context for the modal
const ModalContext = createContext();

// Custom hook to use the modal context
export const useModal = () => useContext(ModalContext);

// Modal provider component
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    modalType: null,
    modalProps: {}
  });

  // Function to open a modal
  const openModal = (modalType, modalProps = {}) => {
    console.log('Opening modal:', modalType, modalProps);
    setModalState({
      isOpen: true,
      modalType,
      modalProps
    });
  };

  // Function to close the modal
  const closeModal = () => {
    console.log('Closing modal');
    setModalState({
      isOpen: false,
      modalType: null,
      modalProps: {}
    });
  };

  // Render the appropriate modal based on modalType
  const renderModal = () => {
    const { isOpen, modalType, modalProps } = modalState;
    
    if (!isOpen) return null;
    
    switch (modalType) {
      case 'comment':
        return <CommentModal {...modalProps} onClose={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {renderModal()}
    </ModalContext.Provider>
  );
};
