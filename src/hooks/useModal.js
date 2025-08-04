import { useState } from 'react';

export const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  const showModal = ({
    title,
    message,
    type = 'info',
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      showCancel
    });
  };

  const hideModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Convenience methods
  const showAlert = (message, title = 'Alert', type = 'info') => {
    showModal({
      title,
      message,
      type,
      confirmText: 'OK'
    });
  };

  const showConfirm = (message, onConfirm, title = 'Confirm', onCancel = null) => {
    return new Promise((resolve) => {
      showModal({
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          if (onCancel) onCancel();
          resolve(false);
        },
        confirmText: 'Yes',
        cancelText: 'No',
        showCancel: true
      });
    });
  };

  const showSuccess = (message, title = 'Success') => {
    showModal({
      title,
      message,
      type: 'success',
      confirmText: 'OK'
    });
  };

  const showError = (message, title = 'Error') => {
    showModal({
      title,
      message,
      type: 'error',
      confirmText: 'OK'
    });
  };

  const showWarning = (message, title = 'Warning') => {
    showModal({
      title,
      message,
      type: 'warning',
      confirmText: 'OK'
    });
  };

  return {
    modalState,
    showModal,
    hideModal,
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning
  };
};

