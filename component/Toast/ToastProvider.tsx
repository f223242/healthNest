import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  text1: string;
  text2?: string;
  type: ToastType;
  duration?: number;
}

interface ShowToastOptions {
  type?: ToastType;
  text1: string;
  text2?: string;
  duration?: number;
}

interface ToastContextType {
  show: (options: ShowToastOptions) => void;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (options: ShowToastOptions) => {
      const id = ++toastId;
      const { type = 'info', text1, text2, duration = 3000 } = options;
      setToasts((prev) => [...prev, { id, text1, text2, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      show({ type, text1: message, duration });
    },
    [show]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ show, showToast, success, error, warning, info }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay((toast.duration || 3000) - 600),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, toast.duration]);

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return { backgroundColor: '#10B981', icon: 'checkmark-circle' as const };
      case 'error':
        return { backgroundColor: '#EF4444', icon: 'close-circle' as const };
      case 'warning':
        return { backgroundColor: '#F59E0B', icon: 'warning' as const };
      case 'info':
      default:
        return { backgroundColor: colors.primary, icon: 'information-circle' as const };
    }
  };

  const { backgroundColor, icon } = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor, opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.white} />
      <View style={styles.textContainer}>
        <Text style={styles.toastTitle}>{toast.text1}</Text>
        {toast.text2 && <Text style={styles.toastText}>{toast.text2}</Text>}
      </View>
    </Animated.View>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    gap: 10,
    minWidth: '80%',
    maxWidth: '100%',
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  toastText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 2,
    opacity: 0.9,
  },
});
