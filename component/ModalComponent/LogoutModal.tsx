import ConfirmationModal from "@/component/ConfirmationModal";
import React from "react";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Logout"
      message="Are you sure you want to logout? You will need to login again to access your account."
      icon="log-out-outline"
      variant="danger"
      confirmText="Logout"
      cancelText="Cancel"
    />
  );
};

export default LogoutModal;
