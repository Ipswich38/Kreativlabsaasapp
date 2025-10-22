import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Mail, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface DashboardProps {
  leads: any[];
}

export function Dashboard({ leads }: DashboardProps) {
  const activeLeads = leads.filter(lead => lead.status === 'active').length;
  const totalLeads = leads.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your CRM activities</p>
      </div>

      {/* System Status Card */}
      <Card className="mb-6 border-2 border-emerald-100 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🚀</span> System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-slate-900">Database</p>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                  ✓ Operational
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-slate-900">Web Scraper</p>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                  🆓 FREE OSM
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-slate-900">Email SMTP</p>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                  Setup Required
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-emerald-700 bg-emerald-100 p-2 rounded">
              🆓 <strong>FREE OpenStreetMap</strong> web scraping - no API keys needed! Search anywhere, anytime.
            </p>
            <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
              📧 Email sending requires Gmail SMTP setup. See <strong>Settings</strong> for configuration.
            </p>
          </div>
        </CardContent>
      </Card>

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
