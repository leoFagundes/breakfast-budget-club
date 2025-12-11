import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { CategoryType } from "@/app/types";

const COLLECTION = "categories";

export default class CategoryRepository {
  static async getAll(): Promise<CategoryType[]> {
    const snap = await getDocs(collection(db, COLLECTION));

    return snap.docs
      .map((d) => {
        const data = d.data() as Omit<CategoryType, "id">;
        return { id: d.id, ...data };
      })
      .sort((a, b) => a.order - b.order);
  }

  static async getById(id: string): Promise<CategoryType | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    const data = snap.data() as CategoryType;
    const { id: _, ...rest } = data;

    return { id: snap.id, ...rest };
  }

  static async create(data: Omit<CategoryType, "id">): Promise<boolean> {
    try {
      const newRef = doc(collection(db, COLLECTION));
      await setDoc(newRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  static async update(id: string, data: Partial<CategoryType>) {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  static async delete(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
}
