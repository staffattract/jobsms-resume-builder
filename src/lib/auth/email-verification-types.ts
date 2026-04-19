export type EmailVerificationConfirmState = {
  error?: string;
  invalidToken?: boolean;
  succeeded?: boolean;
  alreadyVerified?: boolean;
};

export type ResendVerificationState = { ok?: boolean; error?: string };
