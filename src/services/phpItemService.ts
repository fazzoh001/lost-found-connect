import { itemsApi, uploadApi } from "@/services/api";
import { Item, ItemFormData } from "@/types/item";

// Create a new item report
export const createItem = async (
  formData: ItemFormData, 
  type: "lost" | "found", 
  userId: string,
  userEmail: string,
  userName: string
): Promise<string> => {
  let imageUrl: string | undefined;
  
  // Upload image if provided
  if (formData.images.length > 0) {
    try {
      const uploadResult = await uploadApi.uploadImage(formData.images[0]);
      imageUrl = uploadResult.url;
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  }

  const result = await itemsApi.create({
    type,
    title: formData.itemName,
    category: formData.category,
    description: formData.description,
    location: formData.location,
    date_occurred: formData.date.split("T")[0],
    image_url: imageUrl,
  });

  return result.id;
};

// Get all items
export const getAllItems = async (): Promise<Item[]> => {
  const data = await itemsApi.getAll();
  return (data || []).map(mapDbItemToItem);
};

// Get items by type (lost or found)
export const getItemsByType = async (type: "lost" | "found"): Promise<Item[]> => {
  const data = await itemsApi.getAll();
  const filtered = (data || []).filter((item: any) => item.type === type);
  return filtered.map(mapDbItemToItem);
};

// Get items by user
export const getUserItems = async (userId: string): Promise<Item[]> => {
  const data = await itemsApi.getByUser();
  return (data || []).map(mapDbItemToItem);
};

// Get single item by ID
export const getItemById = async (itemId: string): Promise<Item | null> => {
  try {
    const data = await itemsApi.getById(itemId);
    if (!data) return null;
    return mapDbItemToItem(data);
  } catch {
    return null;
  }
};

// Update item
export const updateItem = async (itemId: string, updates: Partial<Item>): Promise<void> => {
  await itemsApi.update(itemId, {
    title: updates.itemName,
    description: updates.description,
    location: updates.location,
    status: updates.status,
  });
};

// Delete item
export const deleteItem = async (itemId: string): Promise<void> => {
  await itemsApi.delete(itemId);
};

// Update item status
export const updateItemStatus = async (
  itemId: string, 
  status: "active" | "matched" | "resolved"
): Promise<void> => {
  await itemsApi.update(itemId, { status });
};

// Helper to map database item to frontend Item type
const mapDbItemToItem = (dbItem: any): Item => ({
  id: dbItem.id,
  userId: dbItem.user_id,
  userEmail: dbItem.user_email || "",
  userName: dbItem.user_name || "",
  type: dbItem.type,
  itemName: dbItem.title,
  category: dbItem.category,
  description: dbItem.description || "",
  location: dbItem.location,
  date: dbItem.date_occurred,
  imageUrls: dbItem.image_url ? [dbItem.image_url] : [],
  contactEmail: dbItem.user_email || "",
  contactPhone: undefined,
  status: dbItem.status,
  matchScore: undefined,
  qrCode: dbItem.qr_code,
  createdAt: new Date(dbItem.created_at),
  updatedAt: new Date(dbItem.updated_at),
});

// Generate QR code data URL for an item
export const generateItemQRCode = async (itemId: string): Promise<string> => {
  const result = await itemsApi.generateQRCode(itemId);
  return result.qr_code;
};
