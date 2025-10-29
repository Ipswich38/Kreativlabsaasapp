import { LayoutDashboard, Mail, Search, LogOut, Users, Send, Zap, Settings, Inbox, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
const logo = 'https://i.imgur.com/I768xBG.png';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout?: () => void;
  isCreator?: boolean;
  hasMultimailAccess?: boolean;
}

export function Sidebar({ activeView, onViewChange, onLogout, isCreator, hasMultimailAccess }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts Management', icon: Users },
    { id: 'lead-generation', label: 'Lead Generation', icon: Search },
    { id: 'sent', label: 'Sent Emails', icon: Inbox },
  ];
  
  // Advanced menu items for users with Multimail access
  const advancedItems = hasMultimailAccess ? [
    { id: 'multimail', label: 'Multimail', icon: Zap, advanced: true },
  ] : [];
  
  // Debug tools for creator only
  const debugItems = isCreator ? [
    { id: 'tracking-diagnostic', label: 'Tracking Diagnostic', icon: Bug, debug: true },
  ] : [];

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
        
        {/* Advanced Tools Section */}
        {advancedItems.length > 0 && (
          <>
            <div className="my-4 border-t border-slate-200" />
            <div className="mb-2">
              <p className="text-xs text-purple-400 px-3 mb-2">{isCreator ? 'CREATOR TOOLS' : 'ADVANCED TOOLS'}</p>
            </div>
            <div className="space-y-1">
              {advancedItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    data-view={item.id}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 border-l-4 border-purple-500'
                        : 'text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <Badge className="bg-purple-500 text-white text-xs">PRO</Badge>
                  </button>
                );
              })}
            </div>
          </>
        )}
        
        {/* Debug Tools Section (Creator Only) */}
        {debugItems.length > 0 && (
          <>
            <div className="my-4 border-t border-slate-200" />
            <div className="mb-2">
              <p className="text-xs text-orange-400 px-3 mb-2">DEBUG TOOLS</p>
            </div>
            <div className="space-y-1">
              {debugItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    data-view={item.id}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-500'
                        : 'text-slate-600 hover:bg-orange-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Happy Teeth Logo" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm text-slate-900">Happy Teeth Support</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
        {onLogout && (
          <Button 
            onClick={onLogout}
            variant="outline"
            className="w-full gap-2 text-slate-600 hover:text-slate-900"
            size="sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        )}
      </div>
    </aside>
  );
}
