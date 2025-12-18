import { useState, useEffect } from "react";
import { Item } from "@/types/item";
import { getAllItems, getUserItems, getItemsByType } from "@/services/itemService";
import { useAuth } from "@/contexts/AuthContext";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, error, refetch: fetchItems };
};

export const useUserItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getUserItems(user.uid);
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  return { items, loading, error, refetch: fetchItems };
};

export const useItemsByType = (type: "lost" | "found") => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItemsByType(type);
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  return { items, loading, error, refetch: fetchItems };
};
