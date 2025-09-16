// src/lib/cakeRequestsApi.js
import { supabase } from "./supabase";

const TABLE = "cake_requests";

/**
 * Creates a new cake request in the database.
 * @param {Object} payload - Request data (must include user_id and other required fields)
 * @returns {Promise<Object>} The newly created request row
 */
export async function createCakeRequest(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}
