export function isNew(createdAt: Date, days: number): boolean {
  const now = new Date()
  const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)
  return diffDays <= days
}
