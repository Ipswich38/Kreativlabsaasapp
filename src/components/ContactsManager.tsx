import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { UserPlus, Pencil, Trash2, Phone, Mail, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import logo from 'figma:asset/4d778675bb728bb5595e9394dadabf32025b40c1.png';

interface Contact {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  contactStatus?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ContactsManagerProps {
  contacts: Contact[];
  onAddContact: (contact: any) => void;
  onUpdateContact: (id: number, contact: any) => void;
  onDeleteContact: (id: number) => void;
}

const CONTACT_STATUSES = [
  { value: 'new', label: '🆕 New', color: 'bg-blue-100 text-blue-800' },
  { value: 'called', label: '📞 Called', color: 'bg-green-100 text-green-800' },
  { value: 'emailed', label: '📧 Emailed', color: 'bg-purple-100 text-purple-800' },
  { value: 'callback', label: '🔄 Callback', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'followup', label: '⏰ Follow-up', color: 'bg-orange-100 text-orange-800' },
  { value: 'interested', label: '⭐ Interested', color: 'bg-pink-100 text-pink-800' },
  { value: 'not_interested', label: '❌ Not Interested', color: 'bg-red-100 text-red-800' },
  { value: 'no_answer', label: '📵 No Answer', color: 'bg-slate-100 text-slate-800' },
  { value: 'voicemail', label: '📬 Voicemail', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'converted', label: '✅ Converted', color: 'bg-emerald-100 text-emerald-800' },
];

export function ContactsManager({ contacts, onAddContact, onUpdateContact, onDeleteContact }: ContactsManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<number | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    contactStatus: 'new',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      website: '',
      contactStatus: 'new',
      notes: '',
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    onAddContact({
      ...formData,
      status: 'active',
      source: 'manual',
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      company: contact.company || '',
      phone: contact.phone || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zipCode: contact.zipCode || '',
      website: contact.website || '',
      contactStatus: contact.contactStatus || 'new',
      notes: contact.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingContact) return;

    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    onUpdateContact(editingContact.id, formData);
    resetForm();
    setIsEditDialogOpen(false);
    setEditingContact(null);
  };

  const handleDelete = (id: number) => {
    setDeleteContactId(id);
  };

  const confirmDelete = () => {
    if (deleteContactId) {
      onDeleteContact(deleteContactId);
      setDeleteContactId(null);
    }
  };

  const handleStatusChange = (contactId: number, newStatus: string) => {
    onUpdateContact(contactId, { contactStatus: newStatus });
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || contact.contactStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statusValue?: string) => {
    const status = CONTACT_STATUSES.find(s => s.value === statusValue) || CONTACT_STATUSES[0];
    return (
      <Badge className={status.color}>
        {status.label}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Contacts Management</h1>
          <p className="text-slate-600">Manage your contact database and track outreach status</p>
        </div>
        <img src={logo} alt="Happy Teeth Logo" className="w-16 h-16 rounded-lg" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Database</CardTitle>
              <CardDescription>
                {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' && ` (filtered by status)`}
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#ff77a4] hover:bg-[#ff5a8f] gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add New Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Enter contact information. Fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-name">Name *</Label>
                      <Input
                        id="add-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-email">Email *</Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-company">Company</Label>
                      <Input
                        id="add-company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="ABC Dental Clinic"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-phone">Phone</Label>
                      <Input
                        id="add-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-address">Address</Label>
                    <Input
                      id="add-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-city">City</Label>
                      <Input
                        id="add-city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Atlanta"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-state">State</Label>
                      <Input
                        id="add-state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="GA"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-zipcode">ZIP Code</Label>
                      <Input
                        id="add-zipcode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="30301"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-website">Website</Label>
                    <Input
                      id="add-website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-status">Contact Status</Label>
                    <Select value={formData.contactStatus} onValueChange={(value) => setFormData({ ...formData, contactStatus: value })}>
                      <SelectTrigger id="add-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-notes">Notes</Label>
                    <Input
                      id="add-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes or comments"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} className="bg-[#ff77a4] hover:bg-[#ff5a8f]">
                    Add Contact
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="🔍 Search contacts by name, email, company, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {CONTACT_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      {contacts.length === 0 ? (
                        <div>
                          <p className="mb-2">No contacts yet</p>
                          <p className="text-sm">Add contacts manually or import from Lead Generation</p>
                        </div>
                      ) : (
                        <p>No contacts match your search criteria</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900">{contact.name}</div>
                          {contact.notes && (
                            <div className="text-xs text-slate-500 mt-1">{contact.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <a href={`mailto:${contact.email}`} className="text-[#ff77a4] hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a href={`tel:${contact.phone}`} className="text-slate-600 hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span className="text-sm">{contact.company}</span>
                          </div>
                        )}
                        {contact.website && (
                          <a
                            href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#ff77a4] hover:underline block mt-1"
                          >
                            Visit website
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {(contact.city || contact.state || contact.zipCode) && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>
                              {[contact.city, contact.state, contact.zipCode].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={contact.contactStatus || 'new'}
                          onValueChange={(value) => handleStatusChange(contact.id, value)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue>
                              {getStatusBadge(contact.contactStatus)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {CONTACT_STATUSES.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(contact)}
                            className="hover:bg-slate-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(contact.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-zipcode">ZIP Code</Label>
                <Input
                  id="edit-zipcode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Contact Status</Label>
              <Select value={formData.contactStatus} onValueChange={(value) => setFormData({ ...formData, contactStatus: value })}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false); setEditingContact(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-[#ff77a4] hover:bg-[#ff5a8f]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteContactId !== null} onOpenChange={(open) => !open && setDeleteContactId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
