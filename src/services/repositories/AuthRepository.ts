import { auth } from "@/services/firebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  User,
} from "firebase/auth";

export default class AuthRepository {
  static async login(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  static async logout() {
    return await signOut(auth);
  }

  static listen(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static async register(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  static async resetPassword(email: string) {
    return await sendPasswordResetEmail(auth, email);
  }

  static async updateEmail(newEmail: string) {
    if (!auth.currentUser) throw new Error("Nenhum usuário está logado.");
    return await fbUpdateEmail(auth.currentUser, newEmail);
  }

  static async updatePassword(newPassword: string) {
    if (!auth.currentUser) throw new Error("Nenhum usuário está logado.");
    return await fbUpdatePassword(auth.currentUser, newPassword);
  }
}
