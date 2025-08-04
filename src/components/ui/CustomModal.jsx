import React from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'error', 'confirm'
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-gaming-neon-green" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-gaming-neon-orange" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-gaming-neon-red" />;
      case 'confirm':
        return <AlertTriangle className="h-8 w-8 text-gaming-neon-yellow" />;
      default:
        return <Info className="h-8 w-8 text-gaming-neon-cyan" />;
    }
  };

  const getModalClass = () => {
    switch (type) {
      case 'success':
        return 'gaming-alert-success';
      case 'warning':
        return 'gaming-alert-warning';
      case 'error':
        return 'gaming-alert-danger';
      default:
        return '';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (type === 'confirm' && showCancel) {
        handleCancel();
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="gaming-modal-overlay" onClick={handleOverlayClick}>
      <div className={`gaming-modal ${getModalClass()}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gaming-text-muted hover:text-gaming-text-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal content */}
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {getIcon()}
          </div>

          {/* Title */}
          {title && (
            <h2 className="gaming-subtitle text-xl font-bold">
              Reflex Esports
            </h2>
          )}

          {/* Message */}
          <div className="gaming-text text-center max-w-md mx-auto">
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            {type === 'confirm' || showCancel ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="gaming-btn-secondary"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="gaming-btn-primary"
                >
                  {confirmText}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConfirm}
                className="gaming-btn-primary"
              >
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;

