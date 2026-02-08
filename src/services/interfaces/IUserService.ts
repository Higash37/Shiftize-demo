import { User, UserData } from "@/common/common-models/model-user/UserModel";

export interface IUserService {
  getUsers(storeId?: string): Promise<(User & { currentPassword?: string })[]>;

  deleteUser(id: string): Promise<void>;

  getUserData(userId: string): Promise<UserData | null>;

  checkMasterExists(storeId?: string): Promise<boolean>;

  checkEmailExists(email: string, storeId?: string): Promise<boolean>;

  checkEmailDuplicate(email: string): Promise<void>;

  findUserByEmail(email: string): Promise<any | null>;

  addSecondaryEmail(userId: string, realEmail: string): Promise<void>;

  secureDeleteUser(userId: string, storeId: string): Promise<void>;

  secureDeleteUserByAdmin(targetUserId: string, storeId: string, adminUserId: string): Promise<void>;
}
