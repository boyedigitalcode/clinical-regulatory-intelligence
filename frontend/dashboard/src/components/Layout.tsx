import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FlaskConical,
  ShieldAlert,
  AlertTriangle,
  GitBranch,
  FileText,
  Menu
} from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const navItems = [
    { name: "Executive Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Competitive Intelligence", path: "/competitive", icon: FlaskConical },
    { name: "FDA Action Tracker", path: "/fda", icon: ShieldAlert },
    { name: "Safety Signal Intelligence", path: "/safety", icon: AlertTriangle },
    { name: "Regulatory Pathway Optimizer", path: "/pathway", icon: GitBranch },
    { name: "Deep Research", path: "/deep-research", icon: FileText },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-300 text-sm">

      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-56"
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-4 transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              Regulatory AI
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 dark:text-gray-300"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={18} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <header className="flex justify-between items-center px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-base font-medium text-gray-800 dark:text-gray-100">
            Clinical Regulatory Intelligence Platform
          </h2>

          {/* Modern Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
              darkMode ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </header>

        <main className="flex-1 p-8 text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}
