import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContactsManager } from './components/ContactsManager';
import { WebScraper } from './components/WebScraper';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { Multimail } from './components/Multimail';
import { SentEmails } from './components/SentEmails';
import { TrackingDiagnostic } from './components/TrackingDiagnostic';
import { leadsApi } from './utils/api';
import { toast, Toaster } from 'sonner@2.0.3';
import { AutoLogoFix } from './components/AutoLogoFix';

type UserType = 'user' | 'admin' | null;

export default function App() {
  const [userType, setUserType] = useState<UserType>(null);
  const [username, setUsername] = useState<string>('');
  const [activeView, setActiveView] = useState('dashboard');
  const [leads, setLeads] = useState<any[]>([]);
  const [scrapedLeads, setScrapedLeads] = useState<any[]>([]); // Persistent scraped data
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved session on mount
  useEffect(() => {
    const savedUserType = localStorage.getItem('htcrm_user_type');
    const savedUsername = localStorage.getItem('htcrm_username');
    if (savedUserType === 'user' || savedUserType === 'admin') {
      setUserType(savedUserType as UserType);
      setUsername(savedUsername || '');
    } else {
      setIsLoading(false);
    }
  }, []);

  // Load leads when user is authenticated
  useEffect(() => {
    if (userType) {
      fetchLeads();
    }
  }, [userType]);

  const handleLogin = (type: 'user' | 'admin', loginUsername: string) => {
    setUserType(type);
    setUsername(loginUsername);
    localStorage.setItem('htcrm_user_type', type);
    localStorage.setItem('htcrm_username', loginUsername);
  };

  const handleLogout = () => {
    setUserType(null);
    setUsername('');
    localStorage.removeItem('htcrm_user_type');
    localStorage.removeItem('htcrm_username');
    setActiveView('dashboard');
    toast.success('Logged out successfully');
  };

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const fetchedLeads = await leadsApi.getAll();
      setLeads(fetchedLeads);
      console.log('Loaded leads from database:', fetchedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLead = async (lead: any) => {
    try {
      const newLead = await leadsApi.create(lead);
      setLeads([...leads, newLead]);
      toast.success('Lead created successfully');
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead');
    }
  };

  const handleUpdateLead = async (id: number, updatedLead: any) => {
    try {
      const updated = await leadsApi.update(id, updatedLead);
      setLeads(leads.map(lead => lead.id === id ? updated : lead));
      toast.success('Lead updated successfully');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  const handleDeleteLead = async (id: number) => {
    try {
      await leadsApi.delete(id);
      setLeads(leads.filter(lead => lead.id !== id));
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleScrapedLeads = async (scrapedData: any[]) => {
    // Store scraped data persistently (doesn't save to DB yet)
    setScrapedLeads(scrapedData);
  };

  const handleImportScrapedLeads = async (leadsToImport: any[]) => {
    try {
      const newLeads = [];
      for (const scrapedLead of leadsToImport) {
        const lead = {
          ...scrapedLead,
          source: 'scraper',
          status: 'active',
          contactStatus: 'new',
        };
        const created = await leadsApi.create(lead);
        newLeads.push(created);
      }
      setLeads([...leads, ...newLeads]);
      toast.success(`Imported ${newLeads.length} leads successfully`);
      
      // Clear scraped data after successful import
      setScrapedLeads([]);
    } catch (error) {
      console.error('Error importing leads:', error);
      toast.error('Failed to import leads');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-[#ff77a4] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard leads={leads} />;
      case 'contacts':
        return (
          <ContactsManager
            contacts={leads}
            onAddContact={handleAddLead}
            onUpdateContact={handleUpdateLead}
            onDeleteContact={handleDeleteLead}
          />
        );
      case 'multimail':
        return <Multimail contacts={leads} username={username} />;
      case 'lead-generation':
        return (
          <WebScraper 
            scrapedLeads={scrapedLeads}
            onScrapedLeads={handleScrapedLeads}
            onImportLeads={handleImportScrapedLeads}
          />
        );
      case 'sent':
        return <SentEmails />;
      case 'tracking-diagnostic':
        return <TrackingDiagnostic />;
      default:
        return <Dashboard leads={leads} />;
    }
  };

  // Show login page if not authenticated
  if (!userType) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Show admin dashboard for admin users
  if (userType === 'admin') {
    return (
      <>
        <Toaster position="top-right" richColors />
        {/* Hidden component that auto-uploads logo on app load */}
        <div style={{ display: 'none' }}>
          <AutoLogoFix />
        </div>
        <AdminDashboard leads={leads} onLogout={handleLogout} />
      </>
    );
  }

  // Show regular CRM for normal users
  const isCreator = username === 'kreativlab';
  // Grant Multimail access to all authenticated users (it's now the primary email tool)
  const hasMultimailAccess = true;
  
  return (
    <>
      <Toaster position="top-right" richColors />
      {/* Hidden component that auto-uploads logo on app load */}
      <div style={{ display: 'none' }}>
        <AutoLogoFix />
      </div>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onLogout={handleLogout}
          isCreator={isCreator}
          hasMultimailAccess={hasMultimailAccess}
        />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </>
  );
}
