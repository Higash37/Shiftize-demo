import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoginModeTabProps {
  loginMode: 'storeId' | 'email';
  onModeChange: (mode: 'storeId' | 'email') => void;
}

export const LoginModeTab: React.FC<LoginModeTabProps> = ({
  loginMode,
  onModeChange,
}) => {
  return (
    <View style={{
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: '#f0f0f0',
      borderRadius: 8
    }}>
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: loginMode === 'storeId' ? '#007bff' : 'transparent',
          borderRadius: 8,
        }}
        onPress={() => onModeChange('storeId')}
      >
        <MaterialIcons 
          name="store" 
          size={18} 
          color={loginMode === 'storeId' ? '#fff' : '#007bff'} 
        />
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: loginMode === 'storeId' ? '#fff' : '#007bff',
          marginLeft: 8,
        }}>
          店舗ID
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: loginMode === 'email' ? '#007bff' : 'transparent',
          borderRadius: 8,
        }}
        onPress={() => onModeChange('email')}
      >
        <MaterialIcons 
          name="email" 
          size={18} 
          color={loginMode === 'email' ? '#fff' : '#007bff'} 
        />
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: loginMode === 'email' ? '#fff' : '#007bff',
          marginLeft: 8,
        }}>
          メール
        </Text>
      </TouchableOpacity>
    </View>
  );
};