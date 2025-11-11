import { UserInterest, IUserInterest } from '../models/userInterest';
import mongoose from 'mongoose';

export interface UserInterestStats {
  total: number;
  active: number;
  inactive: number;
  mostPopular: { interest: IUserInterest, count: number }[];
}

export class UserInterestService {
  async createUserInterest(interestData: Partial<IUserInterest>): Promise<IUserInterest> {
    try {
      const newInterest = new UserInterest(interestData);
      return await newInterest.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getAllUserInterests(skip: number = 0, limit: number = 10, search?: string): Promise<{interests: IUserInterest[], total: number}> {
    try {
      let filter: any = { active: true };

      if (search) {
        filter = {
          ...filter,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const [interests, total] = await Promise.all([
        UserInterest.find(filter)
          .skip(skip)
          .limit(limit)
          .populate('users', 'username email')
          .sort({ name: 1 }),
        UserInterest.countDocuments(filter)
      ]);

      return { interests, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getAllUserInterestsWithInactive(skip: number = 0, limit: number = 10): Promise<{interests: IUserInterest[], total: number}> {
    const interests = await UserInterest.find()
      .skip(skip)
      .limit(limit)
      .populate('users', 'username email')
      .sort({ name: 1 });
   
    const total = await UserInterest.countDocuments();
    return { interests, total };
  }

  async getUserInterestById(id: string): Promise<IUserInterest | null> {
    return await UserInterest.findById(id).populate('users', 'username email');
  }

  async updateUserInterest(id: string, interestData: Partial<IUserInterest>): Promise<IUserInterest | null> {
    return await UserInterest.findByIdAndUpdate(
      id,
      interestData,
      { new: true }
    ).populate('users', 'username email');
  }

  async disableUserInterest(id: string): Promise<IUserInterest | null> {
    return await UserInterest.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
  }

  async reactivateUserInterest(id: string): Promise<IUserInterest | null> {
    return await UserInterest.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    );
  }

  async deleteUserInterest(id: string): Promise<IUserInterest | null> {
    return await UserInterest.findByIdAndDelete(id);
  }

  async addUserToInterest(interestId: string, userId: string): Promise<IUserInterest | null> {
    return await UserInterest.findByIdAndUpdate(
      interestId,
      { $addToSet: { users: userId } },
      { new: true }
    ).populate('users', 'username email');
  }

  async removeUserFromInterest(interestId: string, userId: string): Promise<IUserInterest | null> {
    return await UserInterest.findByIdAndUpdate(
      interestId,
      { $pull: { users: userId } },
      { new: true }
    ).populate('users', 'username email');
  }

  async getUserInterestsByUser(userId: string): Promise<IUserInterest[]> {
    return await UserInterest.find({ users: userId, active: true })
      .populate('users', 'username email')
      .sort({ name: 1 });
  }

  async getUserInterestStats(): Promise<UserInterestStats> {
    const total = await UserInterest.countDocuments();
    const active = await UserInterest.countDocuments({ active: true });
    const inactive = await UserInterest.countDocuments({ active: false });

    // Obtener intereses más populares
    const mostPopular = await UserInterest.aggregate([
      {
        $project: {
          name: 1,
          description: 1,
          color: 1,
          userCount: { $size: "$users" }
        }
      },
      { $sort: { userCount: -1 } },
      { $limit: 5 }
    ]);

    return { total, active, inactive, mostPopular };
  }
}