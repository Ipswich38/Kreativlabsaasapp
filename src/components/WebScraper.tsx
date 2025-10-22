import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Search, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface WebScraperProps {
  onScrapedLeads: (leads: any[]) => void;
}

export function WebScraper({ onScrapedLeads }: WebScraperProps) {
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<any[]>([]);
  const [mustHavePhone, setMustHavePhone] = useState(false); // Changed default to false for OSM
  const [mustHaveWebsite, setMustHaveWebsite] = useState(false); // Changed default to false for OSM
  const [dataSource, setDataSource] = useState<'openstreetmap' | 'google' | null>(null);

  const handleSearch = async () => {
    if (!zipCode.trim() && !city.trim()) {
      toast.error('Please enter at least a ZIP code or city');
      return;
    }

    setIsLoading(true);
    setScrapedData([]);
    setDataSource(null);
    
    try {
      const { scraperApi } = await import('../utils/api');
      
      const response = await scraperApi.scrapeGoogleMaps({
        zipCode,
        city,
        state,
        mustHavePhone,
        mustHaveWebsite
      });
      
      setScrapedData(response.results || []);
      setDataSource(response.mode || 'google');
      
      if ((response.results || []).length === 0) {
        if (response.message) {
          toast.info(response.message);
        } else {
          toast.info('No dental clinics found for this location');
        }
      } else {
        const count = response.results.length;
        const source = response.mode === 'openstreetmap' ? 'OpenStreetMap (FREE)' : 'Google Maps';
        toast.success(`Found ${count} dental clinic${count !== 1 ? 's' : ''} from ${source}`);
      }
    } catch (error: any) {
      console.error('Error scraping dental clinics:', error);
      toast.error(error.message || 'Failed to search for dental clinics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportLeads = () => {
    if (scrapedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    onScrapedLeads(scrapedData);
    toast.success(`Imported ${scrapedData.length} leads to database`);
    setScrapedData([]);
    setZipCode('');
    setCity('');
    setState('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#ff77a4] flex items-center justify-center">
              <span className="text-white">HT</span>
            </div>
            <div>
              <h1 className="text-slate-900">Lead Generation Portal</h1>
              <p className="text-slate-600">Find dental clinics needing admin support</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-900">Happy Teeth Support Services</p>
              <p className="text-xs text-slate-500">Administrative Excellence Team</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#ff77a4] flex items-center justify-center">
              <span className="text-white text-sm">HT</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl">
        {/* Info banner about free OpenStreetMap */}
        <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-emerald-900 mb-1">🆓 FREE OpenStreetMap Integration</h4>
              <p className="text-sm text-emerald-700 mb-2">
                This CRM uses <strong>OpenStreetMap</strong> - completely FREE, no API key required! Search anywhere in the world with no costs.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-emerald-700">
                <span>✅ No API key needed</span>
                <span>✅ Unlimited searches</span>
                <span>✅ Global coverage</span>
                <span>✅ $0 cost forever</span>
              </div>
              <details className="mt-3">
                <summary className="text-sm text-emerald-800 cursor-pointer hover:text-emerald-900">
                  Want premium data? Click for Google Maps upgrade info
                </summary>
                <div className="mt-2 p-3 bg-emerald-100 rounded text-sm text-emerald-900">
                  <p className="mb-2"><strong>Google Maps API adds:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800 mb-2">
                    <li>90%+ phone coverage (vs 30-60% with OSM)</li>
                    <li>80%+ website coverage (vs 20-40% with OSM)</li>
                    <li>Star ratings and review counts</li>
                    <li>More complete business data</li>
                  </ul>
                  <p className="text-xs">
                    Cost: $200/month free credit (~540 searches) • See <strong>SETUP_GUIDE.md</strong>
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
        
        <Card className="p-8">
          <h2 className="text-slate-900 mb-6">Find Dental Clinics</h2>
          
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="grid gap-2">
              <Label htmlFor="zip-code" className="flex items-center gap-2">
                <span className="text-slate-400">📍</span>
                ZIP Code
              </Label>
              <Input
                id="zip-code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="31320"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Midway"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="GA"
              />
            </div>
          </div>

          <div className="mb-6">
            <Label className="mb-3 block">Filters</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="phone-filter"
                  checked={mustHavePhone}
                  onCheckedChange={(checked) => setMustHavePhone(checked as boolean)}
                />
                <label htmlFor="phone-filter" className="text-sm text-slate-700 cursor-pointer">
                  Must have phone
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="website-filter"
                  checked={mustHaveWebsite}
                  onCheckedChange={(checked) => setMustHaveWebsite(checked as boolean)}
                />
                <label htmlFor="website-filter" className="text-sm text-slate-700 cursor-pointer">
                  Must have website
                </label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="bg-[#ff77a4] hover:bg-[#ff5a8f] gap-2"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Find Dental Clinics'}
          </Button>
        </Card>

        {scrapedData.length === 0 && !isLoading && (
          <div className="mt-8">
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-900 mb-2">No leads found yet</h3>
                <p className="text-slate-500 max-w-md">
                  Enter a location above to start finding dental clinics that need administrative support.
                </p>
              </div>
            </Card>
          </div>
        )}

        {scrapedData.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Summary Card */}
            <Card className={dataSource === 'openstreetmap' ? 'bg-emerald-50 border-emerald-200' : 'bg-green-50 border-green-200'}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${dataSource === 'openstreetmap' ? 'text-emerald-600' : 'text-green-600'}`} />
                  <div className="flex-1">
                    <h4 className={dataSource === 'openstreetmap' ? 'text-emerald-900 mb-1' : 'text-green-900 mb-1'}>
                      {dataSource === 'openstreetmap' 
                        ? '🆓 FREE OpenStreetMap Data Retrieved' 
                        : '✅ Live Google Maps Data Retrieved'}
                    </h4>
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2 ${dataSource === 'openstreetmap' ? 'text-emerald-700' : 'text-green-700'}`}>
                      <div>
                        <strong>{scrapedData.length}</strong> businesses found
                      </div>
                      <div>
                        <strong>{scrapedData.filter(l => l.phone).length}</strong> with phones
                      </div>
                      <div>
                        <strong>{scrapedData.filter(l => l.website).length}</strong> with websites
                      </div>
                      <div>
                        {dataSource === 'google' && scrapedData.some(l => l.rating) ? (
                          <><strong>{(scrapedData.reduce((sum, l) => sum + (l.rating || 0), 0) / scrapedData.length).toFixed(1)}</strong> avg rating</>
                        ) : (
                          <span className="text-xs">No ratings (OSM)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-slate-900">Search Results</h3>
                  {dataSource === 'openstreetmap' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      🆓 FREE OpenStreetMap
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      ✓ Google Maps Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  Found {scrapedData.length} dental clinics
                </p>
              </div>
              <Button onClick={handleImportLeads} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Import {scrapedData.length} Leads
              </Button>
            </div>
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clinic Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scrapedData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-sm">{item.email}</TableCell>
                        <TableCell className="text-sm">{item.phone}</TableCell>
                        <TableCell>
                          {item.website && (
                            <a 
                              href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff77a4] hover:underline text-sm"
                            >
                              {item.website}
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{item.address}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">
                            ⭐ {item.rating} ({item.reviews})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.googleMapsUrl && (
                            <a
                              href={item.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff77a4] hover:underline text-sm"
                            >
                              View on Maps
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {scrapedData.length === 0 && !isLoading && (
          <div className="mt-8">
            <Card className="bg-[#ffe9f2] border-[#ff77a4]/30">
              <div className="p-6">
                <h4 className="text-[#ff77a4] mb-2">🌍 Ready to Search Dental Clinics</h4>
                <p className="text-sm text-slate-700 mb-3">
                  Enter a location above to search for dental clinics. Using <strong>FREE OpenStreetMap</strong> data - no API key required!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <span>🆓</span>
                    <span>100% FREE searches</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🌍</span>
                    <span>Global coverage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Real business names</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Accurate addresses</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-[#ffd4e6] rounded text-sm text-slate-900">
                  <p><strong>💡 Tip:</strong> Start without filters to see all results, then enable "Must have phone" or "Must have website" if needed. OSM data quality varies by region.</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
