# HubSpot Contact Manager Frontend

A full-stack application built with React, Vite, ShadCN/UI, and an Express backend to manage HubSpot contact data. It integrates with the HubSpot CRM API to fetch and update contact properties (ZIP and city) and uses the Geoapify API for geocoding based on ZIP codes. Webhooks from HubSpot automatically trigger city updates when a contact's ZIP changes.

---

## Features

* List and view HubSpot contacts with ZIP and city properties
* Update contact ZIP code and automatically geocode to update city
* Manual endpoints for testing geocoding and contact updates
* Webhook listener to process real-time ZIP changes and update city
* Clean UI built with ShadCN/UI components and Tailwind CSS

---

## Tech Stack

* **Frontend**: React, Vite, TypeScript, ShadCN/UI, Sonner (toasts)
* **Backend**: Node.js, Express, Axios
* **APIs**: HubSpot CRM API, Geoapify Geocoding API
* **Styling**: Tailwind CSS

---

## Prerequisites

* Node.js v16+ and npm or pnpm
* A HubSpot Developer account with a private app and API token
* Geoapify API key

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/guilhermeytalokeltec/hubspot-client.git
cd hubspot-client
```

### 2. Install Dependencies

```bash
# using npm
npm install
```

### 3. Run the Frontend

```bash
npm run dev
```

The React app will start on `http://localhost:5173` (or as Vite indicates).

---

## API Endpoints

### Contact Info

* **GET** `/contact-info/:contactId`

  * Fetch a contact’s properties: `zip`, `city`, `firstname`, `lastname`.
  * **Response**:

    ```json
    {
      "success": true,
      "contact": { /* HubSpot contact object */ }
    }
    ```

### List Contacts

* **GET** `/list-contacts`

  * List up to contacts with `zip`, `city`, `firstname`, `lastname`.
  * **Response**: HubSpot paginated results.

### Geocode (Test)

* **GET** `/geocode?postcode=XXXX&country=US`

  * Manual test of Geoapify geocoding for a given ZIP.
  * **Response** returns `postcode`, `country`, `city` (if found), and full raw payload.

### Update ZIP

* **POST** `/update-zip/:contactId`

  * Body: `{ "zip": "12345" }`
  * Updates the contact’s `zip` property.
  * **Response** includes updated contact data.

### Update City (Manual)

* **GET** `/update-city/:contactId`

  * Reads existing `zip`, geocodes via Geoapify, and patches the contact’s `city`.
  * **Response**:

    ```json
    {
      "success": true,
      "contactId": "...",
      "zip": "...",
      "city": "...",
      "message": "Contato ... atualizado com cidade: ..."
    }
    ```

### Webhook Listener

* **POST** `/webhook`

  * Receives HubSpot property change events.
  * Listens for `zip` changes and automatically updates `city`.
  * Always responds with HTTP `200 OK` on success.

---

## Frontend Structure

```
hubspot-client/
├── src/
│   ├── api/
│   │   └── api.ts        # axios wrapper & endpoints
│   ├── components/ui/   # ShadCN/UI primitives
│   ├── components/ContactManager.tsx  # Main UI component
│   ├── interfaces/      # TypeScript types for API payloads
│   ├── services/        # ContactService for API calls
│   ├── App.tsx
│   └── main.tsx
└── vite.config.ts
```

* **ContactManager.tsx**: Displays a list of contacts, detail panel, and ZIP/City update form.
* **contactService.ts**: Handles API interactions (`getAllContacts`, `getContactById`, `updateContactZip`, `updateContactCity`).

---

## Scripts

| Command                  | Description                            |
| ------------------------ | -------------------------------------- |
| `npm run dev`            | Start Vite development server          |


---

## Environment (Backend Only)

| Variable           | Description                             |
| ------------------ | --------------------------------------- |
| `HUBSPOT_TOKEN`    | HubSpot private app token               |
| `GEOAPIFY_API_KEY` | Geoapify API key for geocoding          |
| `PORT`             | Port for Express server (default: 3000) |

---
