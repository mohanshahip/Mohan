import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Image,
  Code,
  User,
  Mail,
  Users,
  Settings,
  Shield,
  Activity,
  Award,
  Globe,
  Database,
  Cloud,
  Smartphone,
  Palette,
  TestTube,
  Wrench,
  Trophy,
  Star,
  BookOpen
} from "lucide-react";

/**
 * Admin Navigation Groups
 * Grouped for better organization in the Sidebar
 */
export const adminNavGroups = [
  {
    title: "admin.dashboard",
    items: [
      { 
        id: "dashboard", 
        icon: LayoutDashboard, 
        path: "/admin", 
        translationKey: "navigation.dashboard" 
      },
      { 
        id: "analytics", 
        icon: Activity, 
        path: "/admin/analytics", 
        translationKey: "dashboard.analytics" 
      }
    ]
  },
  {
    title: "admin.content",
    items: [
      { 
        id: "hero", 
        icon: Globe, 
        path: "/admin/hero", 
        translationKey: "admin.hero-section" 
      },
      { 
        id: "skills", 
        icon: Award, 
        path: "/admin/skills", 
        translationKey: "navigation.skills" 
      },
      { 
        id: "projects", 
        icon: Briefcase, 
        path: "/admin/projects", 
        translationKey: "navigation.projects" 
      },
      { 
        id: "poems", 
        icon: BookOpen, 
        path: "/admin/poems", 
        translationKey: "navigation.poems" 
      },
      { 
        id: "gallery", 
        icon: Image, 
        path: "/admin/gallery", 
        translationKey: "navigation.gallery" 
      }
    ]
  },
  {
    title: "admin.communication",
    items: [
      { 
        id: "contact", 
        icon: Mail, 
        path: "/admin/contact", 
        translationKey: "navigation.contact" 
      }
    ]
  },
  {
    title: "admin.system",
    items: [
      { 
        id: "users", 
        icon: Users, 
        path: "/admin/manage-admins", 
        translationKey: "admin.manage-admins",
        role: "superadmin"
      },
      { 
        id: "profile", 
        icon: User, 
        path: "/admin/profile", 
        translationKey: "admin.my-profile" 
      },
      { 
        id: "settings", 
        icon: Settings, 
        path: "/admin/settings", 
        translationKey: "navigation.settings" 
      }
    ]
  }
];

// Fallback for legacy components
export const adminNavItems = adminNavGroups.flatMap(group => group.items);
