import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StoreIdInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StoreIdInput: React.FC<StoreIdInputProps> = ({
  value,
  onChange,
  placeholder = "例: 1234山田太郎",
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <MaterialIcons name="store" size={20} color="#007bff" />
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 8 }}>
          店舗ID + ニックネーム
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
        autoCapitalize="none"
      />
    </View>
  );
};