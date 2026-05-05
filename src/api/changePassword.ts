import { apiPost } from "./engineClient";

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  const url = `/password-reset`;

  const response = await apiPost<{ success: boolean }>(url, {
    currentPassword,
    newPassword,
  });

  return response;
}
