export interface Item {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: "lost" | "found";
  itemName: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageUrls: string[];
  contactEmail: string;
  contactPhone?: string;
  status: "active" | "matched" | "resolved" | "closed";
  matchScore?: number;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemFormData {
  itemName: string;
  category: string;
  description: string;
  location: string;
  date: string;
  images: File[];
  contactEmail: string;
  contactPhone: string;
}
