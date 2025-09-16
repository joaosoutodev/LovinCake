// src/lib/ordersApi.js
import { supabase } from "./supabase";

const TABLE = "orders";

/**
 * Fetch all orders for a given user, sorted by creation date (newest first).
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of orders (empty array if none found)
 */
export async function listOrders(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
