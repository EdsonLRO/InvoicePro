export async function accountAllowsWrite(
  admin: any,
  userId: string,
): Promise<boolean> {
  const { data, error } = await admin.rpc(
    "account_entitlement_allows_write",
    { p_user_id: userId },
  );
  if (error) throw new Error("Account access could not be confirmed");
  return data === true;
}

export const readOnlyAccountMessage =
  "Your Tallyo account is read-only. Update your subscription to continue.";
