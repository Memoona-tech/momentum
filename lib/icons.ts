import {
  Star,
  HeartPulse,
  BookOpen,
  Code2,
  Dumbbell,
  Brain,
  Coffee,
  Music,
  Wallet,
  Sun,
  Moon,
  PenTool,
  Utensils,
  Bike,
  Droplet,
  Briefcase,
} from "lucide-react";

export const ICONS = {
  Star,
  HeartPulse,
  BookOpen,
  Code2,
  Dumbbell,
  Brain,
  Coffee,
  Music,
  Wallet,
  Sun,
  Moon,
  PenTool,
  Utensils,
  Bike,
  Droplet,
  Briefcase,
} as const;

export type IconName = keyof typeof ICONS;

export function getIcon(name: string | null | undefined) {
  return ICONS[(name as IconName) || "Star"] || Star;
}
