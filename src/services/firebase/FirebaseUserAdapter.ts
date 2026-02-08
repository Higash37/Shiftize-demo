import type { IUserService } from "../interfaces/IUserService";
import { UserService } from "./firebase-user";

export class FirebaseUserAdapter implements IUserService {
  getUsers = UserService.getUsers;
  deleteUser = UserService.deleteUser;
  getUserData = UserService.getUserData;
  checkMasterExists = UserService.checkMasterExists;
  checkEmailExists = UserService.checkEmailExists;
  checkEmailDuplicate = UserService.checkEmailDuplicate;
  findUserByEmail = UserService.findUserByEmail;
  addSecondaryEmail = UserService.addSecondaryEmail;
  secureDeleteUser = UserService.secureDeleteUser;
  secureDeleteUserByAdmin = UserService.secureDeleteUserByAdmin;
}
