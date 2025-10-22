import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LeadsManager } from './components/LeadsManager';
import { EmailBlast } from './components/EmailBlast';
import { WebScraper } from './components/WebScraper';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { leadsApi } from './utils/api';
import { toast, Toaster } from 'sonner@2.0.3';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leads from backend on mount
  useEffect(() => {
    fetchLeads();
  }, []);

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

  const handleScrapedLeads = async (scrapedLeads: any[]) => {
    try {
      const newLeads = [];
      for (const scrapedLead of scrapedLeads) {
        const lead = {
          ...scrapedLead,
          source: 'scraper',
          status: 'active',
        };
        const created = await leadsApi.create(lead);
        newLeads.push(created);
      }
      setLeads([...leads, ...newLeads]);
      toast.success(`Imported ${newLeads.length} leads successfully`);
    } catch (error) {
      console.error('Error importing leads:', error);
      toast.error('Failed to import leads');
    }
  };

  const handleAddTestContacts = async () => {
    const testContacts = [
      {
        name: 'Kreativ Loops',
        email: 'kreativloops@gmail.com',
        company: 'KreativLab',
        phone: '+1 555-0100',
        address: '123 Test St, San Francisco, CA 94102',
        website: 'https://kreativlab.com',
        status: 'active',
        source: 'test'
      },
      {
        name: 'IO Kreativ',
        email: 'io.kreativloops@gmail.com',
        company: 'IO Solutions',
        phone: '+1 555-0101',
        address: '456 Demo Ave, San Francisco, CA 94103',
        website: 'https://iosolutions.com',
        status: 'active',
        source: 'test'
      },
      {
        name: 'Cherwin Fernandez',
        email: 'fernandez.cherwin@gmail.com',
        company: 'Fernandez Consulting',
        phone: '+1 555-0102',
        address: '789 Sample Blvd, San Francisco, CA 94104',
        website: 'https://fernandezconsulting.com',
        status: 'active',
        source: 'test'
      }
    ];

    try {
      const newLeads = [];
      for (const contact of testContacts) {
        // Check if email already exists
        const exists = leads.find(lead => lead.email === contact.email);
        if (!exists) {
          const created = await leadsApi.create(contact);
          newLeads.push(created);
        }
      }
      
      if (newLeads.length > 0) {
        setLeads([...leads, ...newLeads]);
        toast.success(`Added ${newLeads.length} test contact(s)`);
      } else {
        toast.info('Test contacts already exist');
      }
    } catch (error) {
      console.error('Error adding test contacts:', error);
      toast.error('Failed to add test contacts');
      throw error;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#ff77a4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your CRM data...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard leads={leads} />;
      case 'leads':
        return (
          <LeadsManager
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
          />
        );
      case 'email-contacts':
        return <EmailBlast leads={leads} onAddTestContacts={handleAddTestContacts} onNavigateToSettings={() => setActiveView('settings')} />;
      case 'lead-generation':
        return <WebScraper onScrapedLeads={handleScrapedLeads} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard leads={leads} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </>
  );
}
