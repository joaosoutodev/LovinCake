// src/lib/profileApi.js
import { supabase } from "../lib/supabase";

const TABLE = "profiles";
const BUCKET = "avatars";

/**
 * Fetch a single user profile by userId.
 * Returns null if not found.
 */
export async function getProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .single();

  // Ignore "not found" error (PGRST116), throw any other error
  if (error && error.code !== "PGRST116") throw error;

  return data ?? null;
}

/**
 * Insert or update (upsert) a user profile.
 * The profile object must include user_id.
 */
export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(profile, { onConflict: "user_id" })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Uploads a user avatar to Supabase Storage.
 * Overwrites existing avatar if one exists.
 * Returns the public URL of the uploaded image.
 */
export async function uploadAvatar(userId, file) {
  if (!userId || !file) throw new Error("Missing userId or file.");

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${userId}/avatar.${ext}`;

  // Upload file (with overwrite enabled)
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (upErr) throw upErr;

  // Get public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
