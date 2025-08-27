// lib/utils/accounts.ts
export function isOverdue(dueDate: string, status: string): boolean {
  if (status === "paid") return false
  const today = new Date()
  const due = new Date(dueDate)
  return today > due
}