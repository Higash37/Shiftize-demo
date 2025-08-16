import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "パスワードを入力",
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <MaterialIcons name="lock" size={20} color="#007bff" />
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 8 }}>
          パスワード
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
        secureTextEntry
      />
    </View>
  );
};