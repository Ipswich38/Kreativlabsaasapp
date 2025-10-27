import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Search, Download, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import logo from 'figma:asset/4d778675bb728bb5595e9394dadabf32025b40c1.png';
import { searchDentalClinics } from '../lib/googleMaps';
import { leadsApi } from '../lib/api';

interface WebScraperProps {
  scrapedLeads: any[];
  onScrapedLeads: (leads: any[]) => void;
  onImportLeads: (leads: any[]) => void;
}

export function WebScraper({ scrapedLeads, onScrapedLeads, onImportLeads }: WebScraperProps) {
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mustHavePhone, setMustHavePhone] = useState(false);
  const [mustHaveWebsite, setMustHaveWebsite] = useState(false);
  const [mustHaveEmail, setMustHaveEmail] = useState(false);
  const [showApiHelper, setShowApiHelper] = useState(false);

  // Use persistent scrapedLeads from props instead of local state

  const testApiConnection = async () => {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast.error('❌ Google Maps API Key Missing', {
        description: 'Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables',
        duration: 8000
      });
      setShowApiHelper(true);
      return;
    }

    try {
      toast.info('Testing Google Maps API connection...');
      // Simple test by trying to load the API
      const { Loader } = await import('@googlemaps/js-api-loader');
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      toast.success('✅ Google Maps API is working!', {
        description: 'API key is valid and Places API is accessible'
      });
    } catch (error: any) {
      toast.error('❌ Google Maps API Error', {
        description: error.message,
        duration: 8000
      });
      setShowApiHelper(true);
    }
  };

  const handleSearch = async () => {
    // Flexible validation: Allow ZIP code, State, or City+State combinations
    const hasZipCode = zipCode.trim();
    const hasState = state.trim();
    const hasCity = city.trim();

    if (!hasZipCode && !hasState && !hasCity) {
      toast.error('Please enter at least one location field (ZIP code, State, or City)');
      return;
    }

    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast.error('❌ Google Maps API Key Missing', {
        description: 'Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables',
        duration: 8000
      });
      setShowApiHelper(true);
      return;
    }

    setIsLoading(true);
    onScrapedLeads([]);

    try {
      console.log('🔍 Searching dental clinics:', { zipCode, city, state, mustHavePhone, mustHaveWebsite, mustHaveEmail });

      const results = await searchDentalClinics(apiKey, {
        zipCode,
        city,
        state,
        mustHavePhone,
        mustHaveWebsite,
        mustHaveEmail,
        radius: 50000 // 50km radius
      });

      console.log('📥 Search results:', results);

      // Transform results to match expected format
      const transformedResults = results.map(clinic => ({
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone,
        website: clinic.website,
        address: clinic.address,
        rating: clinic.rating?.toString() || '0',
        reviews: clinic.reviews || 0,
        googleMapsUrl: clinic.google_maps_url,
        emailGenerated: !!clinic.email && clinic.email.includes('@')
      }));

      onScrapedLeads(transformedResults);

      if (transformedResults.length === 0) {
        toast.info('No dental clinics found for this location');
      } else {
        const count = transformedResults.length;
        toast.success(`Found ${count} dental clinic${count !== 1 ? 's' : ''} in your target area`);
      }
    } catch (error: any) {
      console.error('Error scraping dental clinics:', error);

      if (error.message?.includes('API key') || error.message?.includes('REQUEST_DENIED')) {
        toast.error('Google Maps API Configuration Error', {
          description: 'Please check your API key and ensure Places API is enabled.',
          duration: 10000,
        });
        setShowApiHelper(true);
      } else {
        toast.error(error.message || 'Failed to search for dental clinics');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportLeads = () => {
    if (scrapedLeads.length === 0) {
      toast.error('No data to import');
      return;
    }

    onImportLeads(scrapedLeads);
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
            <img src={logo} alt="Happy Teeth Logo" className="w-10 h-10 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl">
        <Card className="p-8">
          <h2 className="text-slate-900 mb-6">Find Dental Clinics</h2>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Search Tip:</strong> Enter <strong>ZIP code</strong> (e.g., 31320) <strong>OR</strong> State (e.g., GA) <strong>OR</strong> City + State (e.g., Atlanta, GA)
            </p>
          </div>
          
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
                placeholder="Atlanta"
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
                  id="email-filter"
                  checked={mustHaveEmail}
                  onCheckedChange={(checked) => setMustHaveEmail(checked as boolean)}
                />
                <label htmlFor="email-filter" className="text-sm text-slate-700 cursor-pointer">
                  Must have email
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

        {scrapedLeads.length === 0 && !isLoading && (
          <div className="mt-8">
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-900 mb-2">Ready to Search</h3>
                <p className="text-slate-500 max-w-md">
                  Enter a ZIP code, State, or City + State combination to start finding dental clinics in your target area.
                </p>
              </div>
            </Card>
          </div>
        )}

        {scrapedLeads.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-[#ff77a4]/10 to-[#ff5a8f]/10 border-[#ff77a4]/30">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#ff77a4]" />
                  <div className="flex-1">
                    <h4 className="text-slate-900 mb-1">
                      ✅ Lead Discovery Complete
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mt-2 text-slate-700">
                      <div>
                        <strong>{scrapedLeads.length}</strong> businesses found
                      </div>
                      <div>
                        <strong>{scrapedLeads.filter(l => l.email && !l.emailGenerated).length}</strong> with emails
                      </div>
                      <div>
                        <strong>{scrapedLeads.filter(l => l.phone).length}</strong> with phones
                      </div>
                      <div>
                        <strong>{scrapedLeads.filter(l => l.website).length}</strong> with websites
                      </div>
                      <div>
                        {scrapedLeads.some(l => l.rating) ? (
                          <><strong>{(scrapedLeads.reduce((sum, l) => sum + (parseFloat(l.rating) || 0), 0) / scrapedLeads.length).toFixed(1)}</strong> avg rating</>
                        ) : (
                          <span className="text-xs text-slate-500">Ratings available</span>
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
                  <h3 className="text-slate-900">Discovered Leads</h3>
                  <Badge className="bg-[#ff77a4] text-white">
                    ✓ Verified Data
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  {scrapedLeads.length} qualified dental clinic{scrapedLeads.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button onClick={handleImportLeads} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Import {scrapedLeads.length} Leads
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
                    {scrapedLeads.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-sm">
                          {item.email ? (
                            <div className="flex items-center gap-2">
                              <span>{item.email}</span>
                              {item.emailGenerated && (
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                                  Est.
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">No email</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.phone || <span className="text-slate-400 text-xs">No phone</span>}
                        </TableCell>
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
      </div>
    </div>
  );
}
