import { describe, it, expect, beforeEach } from 'vitest';
import { useOrganizationStore } from './organization.store';
import { act } from '@testing-library/react';

describe('Organization Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useOrganizationStore.setState({
        currentOrganization: null,
        organizations: [],
      });
    });
  });

  it('should have correct initial state', () => {
    const state = useOrganizationStore.getState();
    expect(state.currentOrganization).toBeNull();
    expect(state.organizations).toEqual([]);
  });

  it('should set current organization', () => {
    const mockOrg = {
      _id: 'org-001',
      name: 'Acme Corp',
      slug: 'acme-corp',
      ownerId: 'user-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    act(() => {
      useOrganizationStore.getState().setCurrentOrganization(mockOrg);
    });

    expect(useOrganizationStore.getState().currentOrganization).toEqual(mockOrg);
  });

  it('should set current organization to null (clear)', () => {
    const mockOrg = { _id: 'org-001', name: 'Test' } as any;

    act(() => {
      useOrganizationStore.getState().setCurrentOrganization(mockOrg);
    });
    expect(useOrganizationStore.getState().currentOrganization).not.toBeNull();

    act(() => {
      useOrganizationStore.getState().setCurrentOrganization(null);
    });
    expect(useOrganizationStore.getState().currentOrganization).toBeNull();
  });

  it('should set organizations list', () => {
    const mockOrgs = [
      { _id: 'org-001', name: 'Acme Corp' },
      { _id: 'org-002', name: 'Beta Inc' },
    ] as any[];

    act(() => {
      useOrganizationStore.getState().setOrganizations(mockOrgs);
    });

    expect(useOrganizationStore.getState().organizations).toHaveLength(2);
    expect(useOrganizationStore.getState().organizations[0].name).toBe('Acme Corp');
  });

  it('should replace organizations list entirely', () => {
    const initial = [{ _id: 'org-001', name: 'Old Org' }] as any[];
    const updated = [
      { _id: 'org-002', name: 'New Org 1' },
      { _id: 'org-003', name: 'New Org 2' },
      { _id: 'org-004', name: 'New Org 3' },
    ] as any[];

    act(() => {
      useOrganizationStore.getState().setOrganizations(initial);
    });
    expect(useOrganizationStore.getState().organizations).toHaveLength(1);

    act(() => {
      useOrganizationStore.getState().setOrganizations(updated);
    });
    expect(useOrganizationStore.getState().organizations).toHaveLength(3);
  });
});
