import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import Box from "@/common/common-ui/ui-base/BoxComponent";

// Components
import { CreateGroupHeader } from "./components/CreateGroupHeader";
import { GroupFormSection } from "./components/GroupFormSection";
import { StoreIdSection } from "./components/StoreIdSection";
import { MemberManagementSection } from "./components/MemberManagementSection";
import { CreateGroupActions } from "./components/CreateGroupActions";

// Hooks
import { useCreateGroupState } from "./components/useCreateGroupState";
import { useStoreIdHandlers } from "./components/useStoreIdHandlers";
import { useFormValidation } from "./components/useFormValidation";
import { useGroupCreation } from "./components/useGroupCreation";

export const CreateGroupScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width > 768;

  // カスタムフック
  const {
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
  } = useCreateGroupState();

  const { generateStoreId, checkCustomStoreId } = useStoreIdHandlers(setStoreId);
  const { validateForm } = useFormValidation();
  const { handleCreateGroup } = useGroupCreation();

  const onCreateGroup = async () => {
    if (!validateForm(form, storeId)) return;
    const currentStoreId = getCurrentStoreId();
    await handleCreateGroup(form, currentStoreId, initialMembers, setLoading);
  };

  // 初期化
  useEffect(() => {
    generateStoreId();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <CreateGroupHeader />

      {/* Content */}
      <Box variant="default" padding="large" style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.formContainer, isDesktop && styles.formContainerDesktop]}>
            {/* 基本情報フォーム */}
            <GroupFormSection
              form={form}
              onUpdateForm={updateForm}
            />

            {/* 店舗ID設定 */}
            <StoreIdSection
              storeId={storeId}
              onToggleCustomStoreId={() =>
                setStoreId(prev => ({
                  ...prev,
                  isCustomStoreId: !prev.isCustomStoreId,
                  storeIdError: "",
                }))
              }
              onCustomStoreIdChange={(value) =>
                setStoreId(prev => ({ ...prev, customStoreId: value }))
              }
              onCheckCustomStoreId={checkCustomStoreId}
              onRegenerateStoreId={generateStoreId}
            />

            {/* メンバー管理 */}
            <MemberManagementSection
              members={initialMembers}
              showMemberForm={showMemberForm}
              onToggleMemberForm={() => setShowMemberForm(!showMemberForm)}
              onAddMember={addMember}
              onEditMember={editMember}
              onRemoveMember={removeMember}
            />

            <CreateGroupActions
              loading={loading}
              onCreateGroup={onCreateGroup}
            />
          </View>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    maxWidth: "100%",
  },
  formContainerDesktop: {
    maxWidth: 600,
    alignSelf: "center",
  },
});