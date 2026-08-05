import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { organizationRoutes } from './organization.routes.js';
import { workspaceRoutes } from './workspace.routes.js';
import { membershipRoutes } from './membership.routes.js';
import { invitationRoutes } from './invitation.routes.js';
import { contextRoutes } from './context.routes.js';
import { activityRoutes } from './activity.routes.js';
import { projectRoutes } from './project.routes.js';
import { boardRoutes } from './board.routes.js';
import { taskRoutes } from './task.routes.js';
import { fileRoutes } from './file.routes.js';
import { commentRoutes } from './comment.routes.js';
import { notificationRoutes } from './notification.routes.js';
import { aiRoutes } from '../ai/routes/ai.routes.js';
import { agentRoutes } from '../ai/agents/routes/agent.routes.js';
import { registerActivitySubscribers } from '../subscribers/activity.subscriber.js';
import { registerNotificationSubscribers } from '../subscribers/notification.subscriber.js';
import { registerIndexingSubscribers } from '../subscribers/indexing.subscriber.js';
import { requireDatabaseConnection } from '../middleware/dbCheck.middleware.js';

// Initialize domain event subscribers
registerActivitySubscribers();
registerNotificationSubscribers();
registerIndexingSubscribers();

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);

// Verify database connection for all domain API routes
apiRouter.use(requireDatabaseConnection);

apiRouter.use('/auth', authRoutes);
apiRouter.use('/organizations', organizationRoutes);
apiRouter.use('/workspaces', workspaceRoutes);
apiRouter.use('/memberships', membershipRoutes);
apiRouter.use('/invitations', invitationRoutes);
apiRouter.use('/context', contextRoutes);
apiRouter.use('/activity', activityRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/boards', boardRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/files', fileRoutes);
apiRouter.use('/comments', commentRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/agents', agentRoutes);

export { apiRouter };
