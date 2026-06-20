export function isAdmin(email: string | undefined) {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}
