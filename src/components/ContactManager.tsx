import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle, Edit, MapPin, RefreshCw, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError } from '@/api/api';
import type { Contact } from '@/interfaces/IListContacts';
import { ContactService } from '@/services/contactService';
import { toast } from 'sonner';

const ContactManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newZip, setNewZip] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const contactsData = await ContactService.getAllContacts(50);
      setContacts(contactsData);
    } catch (error) {
      handleError(error, 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchContactInfo = async (contactId: string) => {
    setDetailsLoading(true);
    try {
      const contact = await ContactService.getContactById(contactId);
      setSelectedContact(contact);
      setNewZip(contact.properties.zip || '');
    } catch (error) {
      handleError(error, 'Failed to fetch contact details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateZipAndCity = async (contactId: string, zip: string) => {
    if (!zip.trim()) {
      toast.error('ZIP code is required');
      return;
    }

    if (!ContactService.validateZipCode(zip)) {
      toast.error('Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
      return;
    }

    setUpdateLoading(true);
    try {
      const zipResult = await ContactService.updateContactZip(contactId, zip);

      if (zipResult.success) {
        const cityResult = await ContactService.updateContactCity(contactId);

        if (cityResult.success) {
          toast.success(`ZIP code updated to ${zip} and city updated to ${cityResult.city}!`);
        } else {
          toast.error('ZIP code updated! City update failed - please try again.');
        }

        await fetchContacts();
        if (selectedContact?.id === contactId) {
          await fetchContactInfo(contactId);
        }
      }
    } catch (error) {
      handleError(error, 'Failed to update ZIP code and city');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleError = (error: unknown, fallbackMessage: string) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error(fallbackMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">HubSpot Contact Manager</h1>
          </div>
          <p className="text-gray-600">Manage contact information and location data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur py-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center py-4 justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Contacts ({contacts.length})
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Click on a contact to view details and manage location data
                    </CardDescription>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fetchContacts}
                    disabled={loading}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading && contacts.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Loading contacts...</span>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        onClick={() => fetchContactInfo(contact.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {ContactService.getContactInitials(contact)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {ContactService.getContactDisplayName(contact)}
                                </h3>
                                <p className="text-sm text-gray-500">ID: {contact.id}</p>
                              </div>
                              {ContactService.hasCompleteLocationData(contact) && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{contact.properties.city || 'No city'}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {contact.properties.zip || 'No ZIP'}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{ContactService.formatDate(contact.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Details & Actions */}
          <div>
            {selectedContact ? (
              <div className="space-y-6">
                {/* Contact Info Card */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur py-0">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2  py-4">
                      <User className="w-5 h-5" />
                      Contact Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {detailsLoading ? (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
                        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Name</Label>
                          <p className="text-lg font-semibold text-gray-900">
                            {ContactService.getContactDisplayName(selectedContact)}
                          </p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">ZIP Code</Label>
                            <p className="text-lg font-mono">{selectedContact.properties.zip || 'Not set'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">City</Label>
                            <p className="text-lg">{selectedContact.properties.city || 'Not set'}</p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Last Modified</Label>
                          <p className="text-sm text-gray-800">
                            {ContactService.formatDate(selectedContact.updatedAt)}
                          </p>
                        </div>
                        {ContactService.hasCompleteLocationData(selectedContact) && (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Complete location data</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Update ZIP Code & City Card */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-orange-600" />
                      Update ZIP Code & City
                    </CardTitle>
                    <CardDescription>
                      Enter a new ZIP code - the city will be automatically updated based on the ZIP
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="zip-input">ZIP Code</Label>
                      <Input
                        id="zip-input"
                        type="text"
                        placeholder="e.g., 33755 or 33755-1234"
                        value={newZip}
                        onChange={(e) => setNewZip(e.target.value)}
                        className="mt-1"
                        disabled={updateLoading || detailsLoading}
                      />
                    </div>
                    <Button
                      onClick={() => updateZipAndCity(selectedContact.id, newZip)}
                      disabled={updateLoading || detailsLoading || !newZip.trim()}
                      className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700"
                    >
                      {updateLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Updating ZIP & City...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          <MapPin className="w-4 h-4 mr-1" />
                          Update ZIP & City
                        </>
                      )}
                    </Button>
                    <div className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded">
                      <strong>Note:</strong> Both ZIP code and city will be updated automatically
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Select a Contact
                  </h3>
                  <p className="text-gray-500">
                    Choose a contact from the list to view details and manage their location data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;