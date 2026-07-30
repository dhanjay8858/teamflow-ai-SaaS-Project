import { searchTasks, getTask } from './task.tools.js';
import { searchProjects, getProject, getWorkspace } from './project.tools.js';
import { searchComments } from './comment.tools.js';
import { searchFiles } from './file.tools.js';
import { searchActivities } from './activity.tools.js';
import { searchNotifications } from './notification.tools.js';

export {
  searchTasks,
  getTask,
  searchProjects,
  getProject,
  getWorkspace,
  searchComments,
  searchFiles,
  searchActivities,
  searchNotifications,
};

export const aiToolRegistry = {
  searchTasks,
  getTask,
  searchProjects,
  getProject,
  getWorkspace,
  searchComments,
  searchFiles,
  searchActivities,
  searchNotifications,
};
