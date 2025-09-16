// src/lib/cartApi.js
import { supabase } from "../lib/supabase";

const TABLE = "cart_items";

/**
 * Syncs the local cart to the database.
 * Uses a UNIQUE constraint on (user_id, product_id) in the table.
 */
export async function syncLocalCartToSupabase(localLines, userId) {
  if (!userId || !Array.isArray(localLines) || localLines.length === 0) return;

  // Normalize data before sending
  const rows = localLines.map((li) => ({
    user_id: userId,
    product_id: Number(li.id),
    qty: Number(li.qty || 1),
  }));

  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: "user_id,product_id" });

  if (error) throw error;
}

/**
 * Fetches the user's cart from the database.
 * Returns data in the format: [{ id, qty }]
 */
export async function fetchCartFromSupabase(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("product_id, qty")
    .eq("user_id", userId);

  if (error) throw error;
  return (data || []).map((r) => ({
    id: Number(r.product_id),
    qty: Number(r.qty),
  }));
}

/**
 * Adds N units of a product to the remote cart (upsert).
 */
export async function addLine(userId, productId, qty = 1) {
  if (!userId) return;
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      [{ user_id: userId, product_id: Number(productId), qty: Number(qty) }],
      { onConflict: "user_id,product_id", ignoreDuplicates: false },
    );

  if (error) throw error;
}

/**
 * Sets the exact quantity of a product.
 * If qty <= 0, the product is removed.
 */
export async function setQty(userId, productId, qty) {
  if (!userId) return;
  const n = Number(qty);
  if (n <= 0) {
    return removeLine(userId, productId);
  }
  const { error } = await supabase
    .from(TABLE)
    .update({ qty: n })
    .eq("user_id", userId)
    .eq("product_id", Number(productId));

  if (error) throw error;
}

/**
 * Increments or decrements the current quantity.
 * delta can be +1, -1, or any integer.
 */
export async function bumpQty(userId, productId, delta) {
  if (!userId) return;

  // Read current quantity
  const { data, error } = await supabase
    .from(TABLE)
    .select("qty")
    .eq("user_id", userId)
    .eq("product_id", Number(productId))
    .single();

  // Ignore "not found" error (PGRST116), throw others
  if (error && error.code !== "PGRST116") throw error;

  const current = data?.qty ?? 0;
  const next = current + Number(delta || 0);
  return setQty(userId, productId, next);
}

/**
 * Removes a single product line from the cart.
 */
export async function removeLine(userId, productId) {
  if (!userId) return;
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("product_id", Number(productId));

  if (error) throw error;
}

/**
 * Clears the entire user's cart.
 */
export async function clearCart(userId) {
  if (!userId) return;
  const { error } = await supabase.from(TABLE).delete().eq("user_id", userId);

  if (error) throw error;
}
