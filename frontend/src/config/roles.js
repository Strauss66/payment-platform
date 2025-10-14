import { LayoutDashboard, CreditCard, Users, FileText, BarChart3, Settings, CalendarDays, Megaphone } from "lucide-react";

export const ROLE_CONFIG = {
  super_admin: {
    sidebar: [
      { path: "/superadmin", label: "Overview", icon: LayoutDashboard },
      // Map to existing pages to avoid broken links
      { path: "/app/people/students", label: "Users", icon: Users },
      { path: "/app/billing/reports", label: "Billing", icon: BarChart3 },
      { path: "/app/admin/system-health", label: "System Health", icon: BarChart3 },
      { path: "/app/settings/org", label: "Settings", icon: Settings },
    ],
    dashboard: {
      kpis: ["todaysCollections","pendingInvoices","overdueInvoices"],
      rows: [
        ["collectionsLineChart","paymentMethodMix"],
        ["attentionNeededTable"]
      ]
    }
  },
  admin: {
    sidebar: [
      { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/app/billing/payments", label: "Payments", icon: CreditCard },
      { path: "/app/billing/invoices", label: "Invoices", icon: FileText },
      { path: "/app/people/students", label: "Students", icon: Users },
      { path: "/app/billing/reports", label: "Reports", icon: BarChart3 },
      { path: "/app/announcements", label: "Announcements", icon: Megaphone },
      { path: "/app/events", label: "Events & Calendars", icon: CalendarDays },
      { path: "/app/settings/org", label: "Settings", icon: Settings },
    ],
    dashboard: {
      kpis: ["todaysCollections","pendingInvoices","overdueInvoices","activeDiscounts"],
      rows: [
        ["collectionsLineChart","paymentMethodMix"],
        ["attentionNeededTable"]
      ]
    }
  },
  cashier: {
    sidebar: [
      { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/app/billing/payments", label: "Payments", icon: CreditCard },
      { path: "/app/billing/invoices", label: "Invoices", icon: FileText },
      { path: "/app/billing/reports", label: "Reports", icon: BarChart3 },
      { path: "/app/settings/org", label: "Settings", icon: Settings },
    ],
    dashboard: {
      kpis: ["todaysCollections","pendingInvoices","overdueInvoices"],
      rows: [
        ["collectionsLineChart","paymentMethodMix"],
        ["attentionNeededTable"]
      ]
    }
  },
  teacher: {
    sidebar: [
      { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/app/people/students", label: "Students", icon: Users },
      { path: "/app/events", label: "Events & Calendars", icon: CalendarDays },
      { path: "/app/settings/org", label: "Settings", icon: Settings },
    ],
    dashboard: {
      kpis: ["classesToday","assignmentsToGrade","attendanceAlerts"],
      rows: [
        ["gradeProgressSpark","upcomingEvents"],
        ["recentAnnouncements"]
      ]
    }
  }
};

