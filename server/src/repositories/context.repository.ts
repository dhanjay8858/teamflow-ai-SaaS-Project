import { UserModel } from '../models/user.model.js';
import { IUserDocument } from '../types/auth.types.js';
import { Types } from 'mongoose';

export class WorkspaceContextRepository {
  public async updateUserLastContext(
    userId: string | Types.ObjectId,
    organizationId: string | Types.ObjectId,
    workspaceId: string | Types.ObjectId
  ): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        lastOrganization: organizationId,
        lastWorkspace: workspaceId,
      },
      { new: true }
    ).exec();
  }
}

export const workspaceContextRepository = new WorkspaceContextRepository();
