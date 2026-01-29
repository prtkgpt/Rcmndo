"use client";

import type { Platform } from "@/types/database";

interface PlatformBadgeProps {
  platform: Platform;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const platformConfig: Record<
  Platform,
  { label: string; color: string; bgColor: string }
> = {
  netflix: {
    label: "Netflix",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  prime: {
    label: "Prime",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  disney: {
    label: "Disney+",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  hulu: {
    label: "Hulu",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  hbo: {
    label: "Max",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  apple: {
    label: "Apple TV+",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  peacock: {
    label: "Peacock",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  paramount: {
    label: "Paramount+",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
  },
  crunchyroll: {
    label: "Crunchyroll",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  starz: {
    label: "Starz",
    color: "text-gray-800",
    bgColor: "bg-gray-200",
  },
  tubi: {
    label: "Tubi",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
  },
  youtube: {
    label: "YouTube",
    color: "text-red-600",
    bgColor: "bg-red-600/10",
  },
  mubi: {
    label: "MUBI",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  other: {
    label: "Other",
    color: "text-muted",
    bgColor: "bg-secondary",
  },
};

export function PlatformBadge({
  platform,
  size = "sm",
  showLabel = true,
}: PlatformBadgeProps) {
  const config = platformConfig[platform];
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.color} ${sizes[size]}`}
    >
      {showLabel && config.label}
    </span>
  );
}

export const PLATFORM_OPTIONS = Object.entries(platformConfig).map(
  ([value, { label }]) => ({
    value,
    label,
  })
);
