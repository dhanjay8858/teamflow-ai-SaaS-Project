import { OrganizationModel } from '../models/organization.model.js';
import { IOrganizationDocument } from '../types/organization.types.js';
import { Types } from 'mongoose';

export class OrganizationRepository {
  public async create(data: Partial<IOrganizationDocument>): Promise<IOrganizationDocument> {
    return OrganizationModel.create(data);
  }

  public async findById(id: string | Types.ObjectId): Promise<IOrganizationDocument | null> {
    return OrganizationModel.findById(id).exec();
  }

  public async findByIds(ids: Array<string | Types.ObjectId>): Promise<IOrganizationDocument[]> {
    return OrganizationModel.find({ _id: { $in: ids }, isArchived: false }).exec();
  }

  public async findBySlug(slug: string): Promise<IOrganizationDocument | null> {
    return OrganizationModel.findOne({ slug: slug.toLowerCase() }).exec();
  }

  public async findUserOrganizations(userId: string | Types.ObjectId): Promise<IOrganizationDocument[]> {
    return OrganizationModel.find({ owner: userId, isArchived: false }).exec();
  }

  public async update(id: string | Types.ObjectId, data: Partial<IOrganizationDocument>): Promise<IOrganizationDocument | null> {
    return OrganizationModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public async archive(id: string | Types.ObjectId): Promise<IOrganizationDocument | null> {
    return OrganizationModel.findByIdAndUpdate(id, { isArchived: true }, { new: true }).exec();
  }

  public async incrementWorkspaceCount(id: string | Types.ObjectId, count = 1): Promise<void> {
    await OrganizationModel.findByIdAndUpdate(id, { $inc: { workspaceCount: count } }).exec();
  }
}

export const organizationRepository = new OrganizationRepository();
