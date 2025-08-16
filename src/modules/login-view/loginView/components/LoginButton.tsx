import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface LoginButtonProps {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  onPress,
  loading = false,
  label,
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#007bff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        opacity: loading ? 0.7 : 1
      }}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={{
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
      }}>
        {label || (loading ? "ログイン中..." : "ログイン")}
      </Text>
    </TouchableOpacity>
  );
};