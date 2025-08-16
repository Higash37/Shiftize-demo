import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { GroupService } from "@/services/firebase/firebase-group";
import { GroupCreationForm, InitialMember, StoreIdState } from "./types";

export const useCreateGroupState = () => {
  const [form, setForm] = useState<GroupCreationForm>({
    groupName: "",
    adminNickname: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [storeId, setStoreId] = useState<StoreIdState>({
    generatedStoreId: "",
    customStoreId: "",
    isCustomStoreId: false,
    storeIdCheckLoading: false,
    storeIdError: "",
  });

  const [initialMembers, setInitialMembers] = useState<InitialMember[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const updateForm = (field: keyof GroupCreationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentStoreId = () => {
    return storeId.isCustomStoreId ? storeId.customStoreId : storeId.generatedStoreId;
  };

  const addMember = (member: InitialMember) => {
    setInitialMembers(prev => [...prev, member]);
  };

  const editMember = (index: number, member: InitialMember) => {
    setInitialMembers(prev => 
      prev.map((m, i) => i === index ? member : m)
    );
  };

  const removeMember = (index: number) => {
    setInitialMembers(prev => prev.filter((_, i) => i !== index));
  };

  return {
    form,
    loading,
    setLoading,
    storeId,
    setStoreId,
    initialMembers,
    showMemberForm,
    setShowMemberForm,
    updateForm,
    getCurrentStoreId,
    addMember,
    editMember,
    removeMember,
  };
};