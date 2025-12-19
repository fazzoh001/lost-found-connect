import { supabase } from "@/integrations/supabase/client";
import { Item, ItemFormData } from "@/types/item";

// Create a new item report
export const createItem = async (
  formData: ItemFormData, 
  type: "lost" | "found", 
  userId: string,
  userEmail: string,
  userName: string
): Promise<string> => {
  // For now, we'll skip image upload - can add Supabase storage later
  const imageUrl = formData.images.length > 0 ? null : null;

  const { data, error } = await supabase
    .from("items")
    .insert({
      user_id: userId,
      type,
      title: formData.itemName,
      category: formData.category,
      description: formData.description,
      location: formData.location,
      date_occurred: formData.date.split("T")[0], // Extract date part
      image_url: imageUrl,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

// Get all items
export const getAllItems = async (): Promise<Item[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapDbItemToItem);
};

// Get items by type (lost or found)
export const getItemsByType = async (type: "lost" | "found"): Promise<Item[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapDbItemToItem);
};

// Get items by user
export const getUserItems = async (userId: string): Promise<Item[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapDbItemToItem);
};

// Get single item by ID
export const getItemById = async (itemId: string): Promise<Item | null> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapDbItemToItem(data);
};

// Update item
export const updateItem = async (itemId: string, updates: Partial<Item>): Promise<void> => {
  const { error } = await supabase
    .from("items")
    .update({
      title: updates.itemName,
      description: updates.description,
      location: updates.location,
      status: updates.status,
    })
    .eq("id", itemId);

  if (error) throw error;
};

// Delete item
export const deleteItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (error) throw error;
};

// Update item status
export const updateItemStatus = async (
  itemId: string, 
  status: "active" | "matched" | "resolved"
): Promise<void> => {
  const { error } = await supabase
    .from("items")
    .update({ status })
    .eq("id", itemId);

  if (error) throw error;
};

// Helper to map database item to frontend Item type
const mapDbItemToItem = (dbItem: any): Item => ({
  id: dbItem.id,
  userId: dbItem.user_id,
  userEmail: "",
  userName: "",
  type: dbItem.type,
  itemName: dbItem.title,
  category: dbItem.category,
  description: dbItem.description || "",
  location: dbItem.location,
  date: dbItem.date_occurred,
  imageUrls: dbItem.image_url ? [dbItem.image_url] : [],
  contactEmail: "",
  contactPhone: undefined,
  status: dbItem.status,
  matchScore: undefined,
  qrCode: dbItem.qr_code,
  createdAt: new Date(dbItem.created_at),
  updatedAt: new Date(dbItem.updated_at),
});

// Generate QR code data URL for an item
export const generateItemQRCode = async (itemId: string): Promise<string> => {
  const baseUrl = window.location.origin;
  const qrUrl = `${baseUrl}/items/${itemId}`;
  
  // Update the item with its QR code URL
  const { error } = await supabase
    .from("items")
    .update({ qr_code: qrUrl })
    .eq("id", itemId);

  if (error) throw error;
  
  return qrUrl;
};
