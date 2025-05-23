import type {
    Contact,
    ListContactsResponse,
    ContactInfoResponse,
    UpdateZipResponse,
    UpdateZipRequest,
    UpdateCityResponse
} from '@/interfaces/IListContacts';
import { apiRequest, API_CONFIG } from '../api/api';


export class ContactService {
    static async getAllContacts(limit: number = 10): Promise<Contact[]> {
        const response = await apiRequest<ListContactsResponse>(
            `${API_CONFIG.endpoints.listContacts}?limit=${limit}`
        );
        return response.results;
    }

    static async getContactById(contactId: string): Promise<Contact> {
        const response = await apiRequest<ContactInfoResponse>(
            API_CONFIG.endpoints.contactInfo(contactId)
        );

        if (!response.success) {
            throw new Error('Failed to fetch contact information');
        }

        return response.contact;
    }

    static async updateContactZip(
        contactId: string,
        zipCode: string
    ): Promise<UpdateZipResponse> {
        const requestData: UpdateZipRequest = { zip: zipCode.trim() };

        return apiRequest<UpdateZipResponse>(
            API_CONFIG.endpoints.updateZip(contactId),
            {
                method: 'POST',
                body: JSON.stringify(requestData)
            }
        );
    }

    static async updateContactCity(contactId: string): Promise<UpdateCityResponse> {
        return apiRequest<UpdateCityResponse>(
            API_CONFIG.endpoints.updateCity(contactId),
            {
                method: 'GET'
            }
        );
    }

    static validateZipCode(zipCode: string): boolean {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(zipCode.trim());
    }

    static getContactDisplayName(contact: Contact): string {
        const { firstname, lastname } = contact.properties;

        if (firstname && lastname) {
            return `${firstname} ${lastname}`;
        }

        if (firstname) return firstname;
        if (lastname) return lastname;

        return 'Unnamed Contact';
    }

    static getContactInitials(contact: Contact): string {
        const { firstname, lastname } = contact.properties;

        let initials = '';
        if (firstname) initials += firstname.charAt(0).toUpperCase();
        if (lastname) initials += lastname.charAt(0).toUpperCase();

        return initials || 'U';
    }

    static hasCompleteLocationData(contact: Contact): boolean {
        return !!(contact.properties.zip && contact.properties.city);
    }

    static formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}