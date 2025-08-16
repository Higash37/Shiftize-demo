import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InitialMember } from "./types";
import { MemberFormModal } from "./MemberFormModal";

interface MemberManagementSectionProps {
  members: InitialMember[];
  showMemberForm: boolean;
  onToggleMemberForm: () => void;
  onAddMember: (member: InitialMember) => void;
  onEditMember: (index: number, member: InitialMember) => void;
  onRemoveMember: (index: number) => void;
}

export const MemberManagementSection: React.FC<MemberManagementSectionProps> = ({
  members,
  showMemberForm,
  onToggleMemberForm,
  onAddMember,
  onEditMember,
  onRemoveMember,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>初期メンバー</Text>
        <Text style={styles.subtitle}>（任意：後で追加も可能です）</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onToggleMemberForm}
      >
        <Ionicons name="add-circle" size={20} color="#2563eb" />
        <Text style={styles.addButtonText}>メンバーを追加</Text>
      </TouchableOpacity>

      {members.length > 0 && (
        <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
          {members.map((member, index) => (
            <View key={member.id} style={styles.memberItem}>
              <View style={styles.memberInfo}>
                <View style={styles.memberHeader}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: member.color },
                    ]}
                  />
                  <Text style={styles.memberName}>{member.nickname}</Text>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleText}>
                      {member.role === "master" ? "管理者" : "スタッフ"}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.memberDetails}>
                  パスワード: {member.password}
                  {member.hourlyWage && ` | 時給: ¥${member.hourlyWage.toLocaleString()}`}
                </Text>
              </View>

              <View style={styles.memberActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // 編集機能を実装する場合
                    console.log("Edit member", index);
                  }}
                >
                  <Ionicons name="create" size={18} color="#6b7280" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onRemoveMember(index)}
                >
                  <Ionicons name="trash" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <MemberFormModal
        visible={showMemberForm}
        onClose={onToggleMemberForm}
        onSave={onAddMember}
        existingMembers={members}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderStyle: "dashed",
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  membersList: {
    marginTop: 16,
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  roleTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "500",
  },
  memberDetails: {
    fontSize: 12,
    color: "#6b7280",
  },
  memberActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
});