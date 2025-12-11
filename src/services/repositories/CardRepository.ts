import { db } from "@/services/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { CardType } from "@/app/types";

const COLLECTION = "cards";

export default class CardRepository {
  static async getAll(): Promise<CardType[]> {
    const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as Omit<CardType, "id">;
      return { id: d.id, ...data };
    });
  }

  static async getByCategory(categoryId: string): Promise<CardType[]> {
    const q = query(
      collection(db, COLLECTION),
      where("categoryId", "==", categoryId),
      orderBy("order", "asc")
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as Omit<CardType, "id">;
      return { id: d.id, ...data };
    });
  }

  static async getById(id: string): Promise<CardType | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;

    return { id: snap.id, ...(snap.data() as Omit<CardType, "id">) };
  }

  static async create(data: Omit<CardType, "id">): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTION), data);
    return ref.id;
  }

  static async update(id: string, data: Partial<CardType>) {
    await updateDoc(doc(db, COLLECTION, id), data);
  }

  static async delete(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
}
