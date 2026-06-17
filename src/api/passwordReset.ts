import { apiPost } from "./engineClient";

export type PasswordResetResponse = {
  success: boolean;
  message: string;
};

export function requestPasswordReset(
  identifier: string
): Promise<PasswordResetResponse> {
  return apiPost<PasswordResetResponse>("forgot-password", { identifier });
}
