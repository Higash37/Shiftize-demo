import { Alert } from "react-native";
import { router } from "expo-router";
import { GroupService } from "@/services/firebase/firebase-group";
import { GroupCreationForm, InitialMember } from "./types";

export const useGroupCreation = () => {
  const handleCreateGroup = async (
    form: GroupCreationForm,
    currentStoreId: string,
    initialMembers: InitialMember[],
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    try {
      const result = await GroupService.createGroup({
        groupName: form.groupName,
        storeId: currentStoreId,
        adminNickname: form.adminNickname,
        adminEmail: form.adminEmail || undefined,
        adminPassword: form.adminPassword,
        initialMembers:
          initialMembers.length > 0
            ? initialMembers.map((member) => ({
                nickname: member.nickname,
                password: member.password,
                role: member.role,
                color: member.color,
                hourlyWage: member.hourlyWage,
              }))
            : undefined,
      });

      if (result.success) {
        router.replace({
          pathname: "/(auth)/create-group/success",
          params: {
            groupName: form.groupName,
            storeId: result.storeId,
            memberCount: initialMembers.length.toString(),
            adminNickname: form.adminNickname,
            adminPassword: form.adminPassword,
            membersData: JSON.stringify(
              initialMembers.map((member) => ({
                nickname: member.nickname,
                password: member.password,
                role: member.role,
                color: member.color,
              }))
            ),
          },
        });
      } else {
        Alert.alert("エラー", result.message);
      }
    } catch (error) {
      Alert.alert(
        "エラー",
        "グループの作成に失敗しました。再度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  };

  return { handleCreateGroup };
};