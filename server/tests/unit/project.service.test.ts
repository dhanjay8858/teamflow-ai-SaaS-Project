import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../../src/services/project.service.js';
import { AppError } from '../../src/utils/appError.js';
import { MembershipRole } from '../../src/types/organization.types.js';
import { ProjectStatus } from '../../src/types/project.types.js';

vi.mock('../../src/events/domainEventBus.js', () => ({
  domainEventBus: { publish: vi.fn() },
}));

vi.mock('../../src/services/board.service.js', () => ({
  boardService: { ensureDefaultBoard: vi.fn().mockResolvedValue({}) },
}));

vi.mock('../../src/utils/metrics.js', () => ({
  projectsCounter: { inc: vi.fn() },
}));

const mockWs = {
  _id: { toString: () => 'ws-123' },
  organization: { toString: () => 'org-123' },
  name: 'General Workspace',
  isArchived: false,
};

const mockProject = {
  _id: { toString: () => 'proj-123' },
  workspace: { _id: { toString: () => 'ws-123' }, toString: () => 'ws-123' },
  name: 'Alpha Project',
  slug: 'alpha-project',
  status: ProjectStatus.ACTIVE,
  isArchived: false,
};

describe('ProjectService Unit Tests', () => {
  let mockProjRepo: any;
  let mockProjMemberRepo: any;
  let mockWsRepo: any;
  let mockWsMemberRepo: any;
  let projectService: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProjRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByWsAndSlug: vi.fn(),
      findWorkspaceProjects: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    };
    mockProjMemberRepo = {
      create: vi.fn(),
      findByProjectAndUser: vi.fn(),
    };
    mockWsRepo = {
      findById: vi.fn(),
    };
    mockWsMemberRepo = {
      findByUserAndWorkspace: vi.fn(),
    };

    projectService = new ProjectService(
      mockProjRepo as any,
      mockProjMemberRepo as any,
      mockWsRepo as any,
      mockWsMemberRepo as any
    );
  });

  describe('createProject', () => {
    it('should create a project with default settings when user is workspace OWNER', async () => {
      mockWsRepo.findById.mockResolvedValue(mockWs);
      mockWsMemberRepo.findByUserAndWorkspace.mockResolvedValue({ role: MembershipRole.OWNER });
      mockProjRepo.findByWsAndSlug.mockResolvedValue(null);
      mockProjRepo.create.mockResolvedValue(mockProject);
      mockProjMemberRepo.create.mockResolvedValue({});

      const project = await projectService.createProject('65c1234567890abcdef12345', {
        workspaceId: 'ws-123',
        name: 'Alpha Project',
        slug: 'alpha-project',
      });

      expect(project).toEqual(mockProject);
      expect(mockProjRepo.create).toHaveBeenCalledOnce();
    });

    it('should throw 403 if workspace member is only a MEMBER (not OWNER/ADMIN)', async () => {
      mockWsRepo.findById.mockResolvedValue(mockWs);
      mockWsMemberRepo.findByUserAndWorkspace.mockResolvedValue({ role: MembershipRole.MEMBER });

      await expect(
        projectService.createProject('user-123', {
          workspaceId: 'ws-123',
          name: 'Alpha Project',
          slug: 'alpha-project',
        })
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('getProjectById', () => {
    it('should return project details by ID when user belongs to workspace', async () => {
      mockProjRepo.findById.mockResolvedValue(mockProject);
      mockWsMemberRepo.findByUserAndWorkspace.mockResolvedValue({ role: MembershipRole.MEMBER });

      const project = await projectService.getProjectById('user-123', 'proj-123');
      expect(project.name).toBe('Alpha Project');
    });

    it('should throw 404 if project does not exist', async () => {
      mockProjRepo.findById.mockResolvedValue(null);

      await expect(
        projectService.getProjectById('user-123', 'invalid-id')
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
