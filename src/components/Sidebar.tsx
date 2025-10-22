import { LayoutDashboard, Mail, Search, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';
import logo from 'figma:asset/4d778675bb728bb5595e9394dadabf32025b40c1.png';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads Manager', icon: LayoutDashboard },
    { id: 'email-contacts', label: 'Email Contacts', icon: Mail },
    { id: 'lead-generation', label: 'Lead Generation', icon: Search },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Happy Teeth Logo" className="w-12 h-12 rounded-lg" />
          <div>
            <h2 className="text-slate-900">Happy Teeth CRM</h2>
            <p className="text-xs text-slate-500">Administrative Support Services</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-2">
          <p className="text-xs text-slate-400 px-3 mb-2">MAIN</p>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                data-view={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#ffe9f2] text-[#ff77a4] border-l-4 border-[#ff77a4]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Happy Teeth Logo" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm text-slate-900">Happy Teeth Support</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
