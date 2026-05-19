// Base44 Entity SDK wrapper
// This file provides entity access for the Immigration Portal

const APP_ID = "6a08052b4bda806d077bcc68";
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities`;

function getHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

function createEntityClient(entityName) {
  return {
    async list() {
      const res = await fetch(`${BASE_URL}/${entityName}`, { headers: getHeaders() });
      return res.json();
    },
    async filter(params) {
      const query = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
      const res = await fetch(`${BASE_URL}/${entityName}?${query}`, { headers: getHeaders() });
      return res.json();
    },
    async get(id) {
      const res = await fetch(`${BASE_URL}/${entityName}/${id}`, { headers: getHeaders() });
      return res.json();
    },
    async create(data) {
      const res = await fetch(`${BASE_URL}/${entityName}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async update(id, data) {
      const res = await fetch(`${BASE_URL}/${entityName}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async delete(id) {
      const res = await fetch(`${BASE_URL}/${entityName}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return res.json();
    },
  };
}

export const ImmigrationApplication = createEntityClient("ImmigrationApplication");
