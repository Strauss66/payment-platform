import { LayoutDashboard, CreditCard, Users, FileText, BarChart3, Settings, CalendarDays, Megaphone, BookOpen } from "lucide-react";

export const ROLE_CONFIG = {
  super_admin: {
    sidebar: [
      { path: "/superadmin", label: "Overview", icon: LayoutDashboard },
      // Map to existing pages to avoid broken links
      { path: "/app/people/students", label: "Users", icon: Users },
      { path: "/app/billing/reports", label: "Billing", icon: BarChart3 },
      // System Health hidden for MVP
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
      // Billing
      { path: "/app/billing/payments", label: "Payments", icon: CreditCard },
      { path: "/app/billing/invoices", label: "Invoices", icon: FileText },
      // Single “coming soon” / teaser
      { path: "/app/billing/reports", label: "Reports", icon: BarChart3 },
      // People
      { path: "/app/people/families", label: "Families", icon: Users },
      { path: "/app/people/students", label: "Students", icon: Users },
      { path: "/app/people/teachers", label: "Teachers", icon: Users },
      { path: "/app/people/employees", label: "Employees", icon: Users },
      // Communication & events
      { path: "/app/announcements", label: "Announcements", icon: Megaphone },
      { path: "/app/events", label: "Events & Calendars", icon: CalendarDays },
      // Settings entry point
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
      // Billing
      { path: "/app/billing/payments", label: "Payments", icon: CreditCard },
      { path: "/app/billing/invoices", label: "Invoices", icon: FileText },
      // Cashier tools
      { path: "/app/cashier/panel", label: "Cashier Panel", icon: LayoutDashboard },
      { path: "/app/cashier/closeout", label: "Closeout", icon: BarChart3 },
    ],
    dashboard: {
      kpis: ["todaysCollections","pendingInvoices","overdueInvoices"],
      rows: [
        ["collectionsLineChart","paymentMethodMix"],
        ["cashierSessionStatus","attentionNeededTable"]
      ]
    }
  },
  student_parent: {
    sidebar: [
      { path: "/app/dashboard", label: "Home", icon: LayoutDashboard },
      { path: "/app/courses", label: "Courses", icon: BookOpen },
      { path: "/app/portal/invoices", label: "Invoices", icon: FileText },
      { path: "/app/portal/payments", label: "Payments", icon: CreditCard },
    ],
    // Simple placeholders for now; refine as needed
    dashboard: {
      kpis: [],
      rows: [
        ["parentSummary","recentAnnouncements"]
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

