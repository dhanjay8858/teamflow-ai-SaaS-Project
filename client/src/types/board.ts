export interface Board {
  _id: string;
  project: {
    _id: string;
    name: string;
    slug: string;
  };
  name: string;
  slug: string;
  description?: string;
  color?: string;
  position: number;
  isDefault: boolean;
  isArchived: boolean;
  createdBy: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardPayload {
  projectId: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface UpdateBoardPayload {
  name?: string;
  description?: string;
  color?: string;
}

export interface ReorderBoardItem {
  boardId: string;
  position: number;
}
