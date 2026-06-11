import { Home, Filter, CalendarDays, User } from 'lucide-react'

export type TabVendedor = 'home' | 'metricas' | 'agenda' | 'perfil'

interface BottomNavProps {
  activeTab: TabVendedor
  onChangeTab: (tab: TabVendedor) => void
}

const tabs: { key: TabVendedor; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'metricas', label: 'Métricas', icon: Filter },
  { key: 'agenda', label: 'Agenda', icon: CalendarDays },
  { key: 'perfil', label: 'Perfil', icon: User },
]

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => onChangeTab(key)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
