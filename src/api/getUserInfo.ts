import { apiGet, apiPost } from "./engineClient";
import type { MobileUser, MobileUserUpdate } from '../navigation/types';

export async function getUserInfo(userId: string): Promise<MobileUser> {
  const url = `/user/${encodeURIComponent(userId)}`;
  const response = await apiGet<MobileUser>(url);
  return response;
}

export async function postUserInfo(
  user: { id: string } & MobileUserUpdate
): Promise<MobileUser> {
  const url = `/user/${encodeURIComponent(user.id)}`;
  const response = await apiPost<MobileUser>(url, user);
  return response;
}