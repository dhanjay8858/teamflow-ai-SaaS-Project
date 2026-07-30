import { UserModel } from '../models/user.model.js';
import { IUserDocument } from '../types/auth.types.js';
import { Types } from 'mongoose';

export class UserRepository {
  public async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    return UserModel.create(userData);
  }

  public async findByEmail(email: string, selectPassword = false): Promise<IUserDocument | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (selectPassword) {
      query.select('+password');
    }
    return query.exec();
  }

  public async findByUsername(username: string, selectPassword = false): Promise<IUserDocument | null> {
    const query = UserModel.findOne({ username: username.toLowerCase() });
    if (selectPassword) {
      query.select('+password');
    }
    return query.exec();
  }

  public async findById(id: string | Types.ObjectId, includeRefreshToken = false): Promise<IUserDocument | null> {
    const query = UserModel.findById(id);
    if (includeRefreshToken) {
      query.select('+refreshToken');
    }
    return query.exec();
  }

  public async findByEmailOrUsername(emailOrUsername: string, selectPassword = true): Promise<IUserDocument | null> {
    const term = emailOrUsername.toLowerCase();
    const query = UserModel.findOne({
      $or: [{ email: term }, { username: term }],
    });
    if (selectPassword) {
      query.select('+password');
    }
    return query.exec();
  }

  public async updateUser(id: string | Types.ObjectId, updateData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async updateRefreshToken(id: string | Types.ObjectId, hashedRefreshToken: string | null): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { refreshToken: hashedRefreshToken }).exec();
  }

  public async updateLastLogin(id: string | Types.ObjectId): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }
}

export const userRepository = new UserRepository();
