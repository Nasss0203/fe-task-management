import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export const formatDate = (date: string | null): string => {
  if (!date) return "Chưa có";
  try {
    return format(new Date(date), "dd/MM/yyyy");
  } catch {
    return "Chưa có";
  }
};

export const formatDaysRemaining = (days: number | null): string => {
  if (days === null) return "Chưa có deadline";
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
};

export const formatRelativeTime = (date: string): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  } catch {
    return "vừa xong";
  }
};

export const getStatusFallbackColor = (index: number): string => {
  const colors = [
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#10B981", // green
    "#EF4444", // red
    "#F59E0B", // amber
    "#6366F1", // indigo
    "#EC4899", // pink
  ];
  return colors[index % colors.length];
};
