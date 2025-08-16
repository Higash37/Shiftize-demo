import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder = "example@email.com",
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <MaterialIcons name="email" size={20} color="#007bff" />
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 8 }}>
          メールアドレス
        </Text>
      </View>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          backgroundColor: '#fff'
        }}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );
};