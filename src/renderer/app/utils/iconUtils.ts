import {
  Home,
  FolderOpen,
  Search,
  GitBranch,
  Users,
  Settings,
  FileText,
  Monitor,
  Building,
  Database,
  Terminal,
  Package,
  Zap,
  Shield,
  Bell,
  Mail,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Warehouse,
  SquareFunction,
  HelpCircle,
  Map,
  type LucideIcon,
} from "lucide-react";

// Comprehensive icon map for easy extension
export const iconMap: Record<string, LucideIcon> = {
  // Navigation & Core
  Home,
  FolderOpen,
  Search,
  GitBranch,
  Users,
  Settings,
  FileText,
  Monitor,
  Building,
  Warehouse,

  // Data & Storage
  Database,
  Package,

  // Development
  Terminal,
  Zap,

  // Security & Communication
  Shield,
  Bell,
  Mail,

  // Time & Scheduling
  Calendar,
  Clock,
  Map,

  // Analytics & Charts
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  SquareFunction,
  HelpCircle,
};

// Helper function to get icon component by name
export const getIconComponent = (iconName: string): LucideIcon | null => {
  return iconMap[iconName] || null;
};

// Helper function to get all available icon names
export const getAvailableIcons = (): string[] => {
  return Object.keys(iconMap);
};
