// constants/reportConstants.ts
import { ReportStatus, SeverityLevel } from "../../../../lib/supabase"
import type { MaterialCommunityIcons } from "@expo/vector-icons"

type IconName = keyof typeof MaterialCommunityIcons.glyphMap

export const SEVERITY_COLORS = {
  [SeverityLevel.DANGER]: "#DC2626", // Red for danger
  [SeverityLevel.MEDIUM]: "#F59E0B", // Amber for medium
  [SeverityLevel.LOW]: "#4ADE80", // Brighter green for low
}

export const STATUS_COLORS = {
  [ReportStatus.SUBMITTED]: "#64748B", // Gray for submitted
  [ReportStatus.IN_PROGRESS]: "#3B82F6", // Blue for in progress
  [ReportStatus.FIXED]: "#4ADE80", // Brighter green for fixed
  [ReportStatus.REJECTED]: "#6B7280", // Gray for rejected
}

export const STATUS_ICONS: Record<ReportStatus, IconName> = {
  [ReportStatus.SUBMITTED]: "check-circle-outline",
  [ReportStatus.IN_PROGRESS]: "progress-clock",
  [ReportStatus.FIXED]: "check-circle",
  [ReportStatus.REJECTED]: "close-circle",
}

export default {
  SEVERITY_COLORS,
  STATUS_COLORS,
  STATUS_ICONS,
}
