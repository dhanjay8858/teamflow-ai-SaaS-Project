import { create } from 'zustand';
import { Organization } from '../types/organization';

interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  currentOrganization: null,
  organizations: [],
  setCurrentOrganization: (currentOrganization) => set({ currentOrganization }),
  setOrganizations: (organizations) => set({ organizations }),
}));
