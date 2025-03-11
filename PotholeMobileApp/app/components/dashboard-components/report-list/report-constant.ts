// constants/reportConstants.ts
import { ReportStatus, SeverityLevel } from "../../../../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const SEVERITY_COLORS = {
  [SeverityLevel.DANGER]: "#DC2626",
  [SeverityLevel.MEDIUM]: "#F59E0B",
  [SeverityLevel.LOW]: "#10B981",
};

export const STATUS_COLORS = {
  [ReportStatus.SUBMITTED]: "#64748B",
  [ReportStatus.IN_PROGRESS]: "#2563EB",
  [ReportStatus.FIXED]: "#059669",
  [ReportStatus.REJECTED]: "#6B7280",
};

export const STATUS_ICONS: Record<ReportStatus, IconName> = {
  [ReportStatus.SUBMITTED]: "check-circle-outline",
  [ReportStatus.IN_PROGRESS]: "progress-clock",
  [ReportStatus.FIXED]: "check-circle",
  [ReportStatus.REJECTED]: "close-circle",
};