export const mockUser = {
  _id: '65c1234567890abcdef12345',
  name: 'Test Engineer',
  username: 'test_eng',
  email: 'engineer@teamflow.ai',
  password: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
  avatar: 'https://cloudinary.com/avatar.jpg',
};

export const mockOrganization = {
  _id: '65c9876543210fedcba54321',
  name: 'TeamFlow AI Test Org',
  slug: 'teamflow-test-org',
  owner: mockUser._id,
  members: [
    {
      user: mockUser._id,
      role: 'OWNER',
      joinedAt: new Date(),
    },
  ],
};

export const mockWorkspace = {
  _id: '65c6789012345abcdef67890',
  organization: mockOrganization._id,
  name: 'General',
  slug: 'general',
  isDefault: true,
  members: [
    {
      user: mockUser._id,
      role: 'MANAGER',
    },
  ],
};

export const mockProject = {
  _id: '65c111112222333344445555',
  workspace: mockWorkspace._id,
  organization: mockOrganization._id,
  name: 'Alpha Engine',
  slug: 'alpha-engine',
  status: 'ACTIVE',
  createdBy: mockUser._id,
};

export const mockTask = {
  _id: '65c999998888777766665555',
  project: mockProject._id,
  workspace: mockWorkspace._id,
  taskKey: 'ALPHA-1',
  title: 'Implement Authentication API',
  description: 'Full OAuth2 and JWT token authentication',
  status: 'TODO',
  priority: 'HIGH',
  reporter: mockUser._id,
};

export const mockComment = {
  _id: '65c777777777777777777777',
  task: mockTask._id,
  author: mockUser._id,
  markdown: 'Great work on this task! @test_eng',
  isEdited: false,
};

export const mockNotification = {
  _id: '65c888888888888888888888',
  recipient: mockUser._id,
  title: 'Task Assigned',
  message: 'You were assigned to ALPHA-1',
  isRead: false,
};
