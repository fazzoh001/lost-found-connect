import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Item, ItemFormData } from "@/types/item";
import { User } from "firebase/auth";

const ITEMS_COLLECTION = "items";

// Upload images to Firebase Storage
export const uploadImages = async (files: File[], userId: string): Promise<string[]> => {
  const urls: string[] = [];
  
  for (const file of files) {
    const timestamp = Date.now();
    const storageRef = ref(storage, `items/${userId}/${timestamp}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  
  return urls;
};

// Create a new item report
export const createItem = async (
  formData: ItemFormData, 
  type: "lost" | "found", 
  user: User
): Promise<string> => {
  // Upload images first
  const imageUrls = formData.images.length > 0 
    ? await uploadImages(formData.images, user.uid) 
    : [];

  const itemData = {
    userId: user.uid,
    userEmail: user.email || "",
    userName: user.displayName || "Anonymous",
    type,
    itemName: formData.itemName,
    category: formData.category,
    description: formData.description,
    location: formData.location,
    date: formData.date,
    imageUrls,
    contactEmail: formData.contactEmail,
    contactPhone: formData.contactPhone || null,
    status: "active",
    matchScore: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), itemData);
  return docRef.id;
};

// Get all items
export const getAllItems = async (): Promise<Item[]> => {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Item[];
};

// Get items by type (lost or found)
export const getItemsByType = async (type: "lost" | "found"): Promise<Item[]> => {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    where("type", "==", type),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Item[];
};

// Get items by user
export const getUserItems = async (userId: string): Promise<Item[]> => {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Item[];
};

// Get single item by ID
export const getItemById = async (itemId: string): Promise<Item | null> => {
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
  } as Item;
};

// Update item
export const updateItem = async (itemId: string, updates: Partial<Item>): Promise<void> => {
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete item
export const deleteItem = async (itemId: string): Promise<void> => {
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  await deleteDoc(docRef);
};

// Update item status
export const updateItemStatus = async (
  itemId: string, 
  status: "active" | "matched" | "resolved"
): Promise<void> => {
  await updateItem(itemId, { status });
};
