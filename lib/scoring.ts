export function dateFromStartOffset(startDate: string, offsetDays: number): string {
  const d = new Date(`${startDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function getCurrentPlanDay(startDate: string, totalDays: number, today: string): number {
  const start = new Date(`${startDate}T00:00:00Z`)
  const now = new Date(`${today}T00:00:00Z`)
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1
  return Math.min(Math.max(diff, 1), totalDays)
}

export type DayStatus = 'future' | 'partial' | 'missed' | 'done-ontime' | 'done-late'

export function computeDayStatus(params: {
  startDate: string
  dayNumber: number
  taskCount: number
  checkedCount: number
  completedDate: string | null
  today: string
}): DayStatus {
  const { startDate, dayNumber, taskCount, checkedCount, completedDate, today } = params
  const scheduledDate = dateFromStartOffset(startDate, dayNumber - 1)
  const allDone = taskCount > 0 && checkedCount === taskCount
  if (allDone) {
    return completedDate && completedDate > scheduledDate ? 'done-late' : 'done-ontime'
  }
  if (scheduledDate > today) return 'future'
  if (checkedCount > 0) return 'partial'
  return 'missed'
}

export interface DayScoreInput {
  taskCount: number
  checkedCount: number
  scheduledDate: string
  completedDate: string | null
}

export function computeScore(days: DayScoreInput[]): { score: number; doneOnTime: number } {
  let score = 0
  let doneOnTime = 0
  for (const day of days) {
    score += day.checkedCount * 10
    const allDone = day.taskCount > 0 && day.checkedCount === day.taskCount
    if (allDone) {
      score += 20
      if (day.completedDate && day.completedDate <= day.scheduledDate) {
        score += 10
        doneOnTime++
      }
    }
  }
  return { score, doneOnTime }
}
