import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { UserType } from "@/app/types";

const COLLECTION = "users";

export default class UserRepository {
  static async getById(id: string): Promise<UserType | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data() as UserType;
    const { id: ignored, ...rest } = data;

    return { id: snap.id, ...rest };
  }

  static async create(data: UserType): Promise<boolean> {
    try {
      const { id, role, ...rest } = data;

      await setDoc(doc(db, COLLECTION, id), {
        ...rest,
        role: role ?? "guest",
        createdAt: data.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch {
      return false;
    }
  }

  static async getAll(): Promise<UserType[]> {
    const snap = await getDocs(collection(db, COLLECTION));

    return snap.docs.map((d) => {
      const data = d.data() as UserType;
      const { id: ignored, ...rest } = data;

      return { id: d.id, ...rest };
    });
  }

  static async updateRole(id: string, role: UserType["role"]) {
    await updateDoc(doc(db, COLLECTION, id), {
      role,
      updatedAt: new Date().toISOString(),
    });
  }

  static async delete(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
}
