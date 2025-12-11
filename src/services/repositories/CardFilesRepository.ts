/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, storage } from "@/services/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const COLLECTION = "cardFiles";

export default class CardFilesRepository {
  static async list(cardId: string) {
    const q = query(collection(db, COLLECTION), where("cardId", "==", cardId));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }

  static async uploadFile(cardId: string, file: File) {
    const path = `cardFiles/${cardId}/${file.name}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    const docRef = await addDoc(collection(db, "cardFiles"), {
      cardId,
      name: file.name,
      url,
      path,
      createdAt: new Date().toISOString(),
    });

    return docRef.id;
  }

  static async delete(cardId: string, file: any) {
    // 1. Deleta do Storage
    const fileRef = ref(storage, `cardFiles/${cardId}/${file.name}`);
    await deleteObject(fileRef);

    // 2. Deleta do Firestore
    await deleteDoc(doc(db, "cardFiles", file.id));
  }
}
