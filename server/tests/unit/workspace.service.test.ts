import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceService } from '../../src/services/workspace.service.js';
import { MembershipRole } from '../../src/types/organization.types.js';

vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn() },
}));

const validOrgId = '65c1234567890abcdef12345';
const validUserId = '65c9876543210fedcba54321';
const validWsId = '65c111112222333344445555';

const mockOrg = {
  _id: { toString: () => validOrgId },
  name: 'Test Org',
  isArchived: false,
};

const mockWorkspace = {
  _id: { toString: () => validWsId },
  name: 'General Workspace',
  slug: 'general',
  description: 'Default general workspace',
  icon: 'layout',
  organization: { toString: () => validOrgId },
  isDefault: false,
  isArchived: false,
};

describe('WorkspaceService Unit Tests', () => {
  let mockWsRepo: any;
  let mockOrgRepo: any;
  let mockMemberRepo: any;
  let workspaceService: WorkspaceService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWsRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOrgAndSlug: vi.fn(),
      findOrgWorkspaces: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    };
    mockOrgRepo = {
      findById: vi.fn(),
      incrementWorkspaceCount: vi.fn(),
    };
    mockMemberRepo = {
      create: vi.fn(),
    };

    workspaceService = new WorkspaceService(
      mockWsRepo as any,
      mockOrgRepo as any,
      mockMemberRepo as any
    );
  });

  describe('createWorkspace', () => {
    it('should create a workspace with formatted slug and auto-assign owner role', async () => {
      mockOrgRepo.findById.mockResolvedValue(mockOrg);
      mockWsRepo.findByOrgAndSlug.mockResolvedValue(null);
      mockWsRepo.create.mockResolvedValue(mockWorkspace);
      mockMemberRepo.create.mockResolvedValue({});
      mockOrgRepo.incrementWorkspaceCount.mockResolvedValue(undefined);

      const result = await workspaceService.createWorkspace(validUserId, {
        organizationId: validOrgId,
        name: 'General Workspace',
        slug: 'general',
      });

      expect(result).toEqual(mockWorkspace);
      expect(mockWsRepo.create).toHaveBeenCalledOnce();
      expect(mockMemberRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: MembershipRole.OWNER,
        })
      );
    });

    it('should throw 404 if organization is not found', async () => {
      mockOrgRepo.findById.mockResolvedValue(null);

      await expect(
        workspaceService.createWorkspace(validUserId, {
          organizationId: validOrgId,
          name: 'New Ws',
          slug: 'new-ws',
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 409 if workspace slug already exists in organization', async () => {
      mockOrgRepo.findById.mockResolvedValue(mockOrg);
      mockWsRepo.findByOrgAndSlug.mockResolvedValue(mockWorkspace);

      await expect(
        workspaceService.createWorkspace(validUserId, {
          organizationId: validOrgId,
          name: 'General Workspace',
          slug: 'general',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('getOrgWorkspaces', () => {
    it('should list all active workspaces in an organization', async () => {
      mockOrgRepo.findById.mockResolvedValue(mockOrg);
      mockWsRepo.findOrgWorkspaces.mockResolvedValue([mockWorkspace]);

      const workspaces = await workspaceService.getOrgWorkspaces(validUserId, validOrgId);
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].name).toBe('General Workspace');
    });

    it('should throw 404 if organization does not exist', async () => {
      mockOrgRepo.findById.mockResolvedValue(null);

      await expect(
        workspaceService.getOrgWorkspaces(validUserId, validOrgId)
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('archiveWorkspace', () => {
    it('should throw 400 when trying to archive default workspace', async () => {
      mockWsRepo.findById.mockResolvedValue({ ...mockWorkspace, isDefault: true });

      await expect(
        workspaceService.archiveWorkspace(validWsId)
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should archive a non-default workspace', async () => {
      mockWsRepo.findById.mockResolvedValue({ ...mockWorkspace, isDefault: false });
      mockWsRepo.archive.mockResolvedValue(undefined);

      await workspaceService.archiveWorkspace(validWsId);
      expect(mockWsRepo.archive).toHaveBeenCalledWith(validWsId);
    });
  });
});
