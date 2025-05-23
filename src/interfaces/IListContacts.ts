export interface ContactProperties {
  city?: string;
  createdate: string;
  firstname?: string;
  hs_object_id: string;
  lastmodifieddate: string;
  lastname?: string;
  zip?: string;
}

export interface Contact {
  id: string;
  properties: ContactProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface ListContactsResponse {
  results: Contact[];
}

export interface ContactInfoResponse {
  success: boolean;
  contact: Contact;
}

export interface UpdateZipRequest {
  zip: string;
}

export interface UpdateZipResponse {
  success: boolean;
  message: string;
  contact: Contact;
}

export interface UpdateCityResponse {
  success: boolean;
  contactId: string;
  zip: string;
  city: string;
  message: string;
}

export interface ApiError {
  error: string;
  stack?: string;
}