import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Mail, TrendingUp, Clock } from 'lucide-react';
import logo from 'figma:asset/4d778675bb728bb5595e9394dadabf32025b40c1.png';

interface DashboardProps {
  leads: any[];
}

export function Dashboard({ leads }: DashboardProps) {
  const activeLeads = leads.filter(lead => lead.status === 'active').length;
  const totalLeads = leads.length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Overview of your CRM activities</p>
        </div>
        <img src={logo} alt="Happy Teeth Logo" className="w-16 h-16 rounded-lg" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalLeads}</div>
            <p className="text-xs text-slate-500 mt-1">All time contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Active Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeLeads}</div>
            <p className="text-xs text-slate-500 mt-1">Currently engaged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Email Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-[#ff77a4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">0</div>
            <p className="text-xs text-slate-500 mt-1">Sent this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Today</div>
            <p className="text-xs text-slate-500 mt-1">Last update</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Your latest contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">{lead.email}</p>
                  <p className="text-xs text-slate-400">{lead.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
