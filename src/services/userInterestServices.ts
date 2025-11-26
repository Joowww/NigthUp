import { UserInterest, IUserInterest } from '../models/userInterest';
import mongoose from 'mongoose';

export interface UserInterestStats {
  total: number;
  active: number;
  inactive: number;
  mostPopular: { tagId: string, count: number }[];
}

export class UserInterestService {
  async createUserInterest(interestData: Partial<IUserInterest>): Promise<IUserInterest> {
    try {
      const { userId, tagId, score, active } = interestData;
      if (!userId || !tagId || typeof score !== 'number') {
        throw new Error('userId, tagId y score son requeridos');
      }

      const updated = await UserInterest.findOneAndUpdate(
        { userId, tagId },
        { $set: { score, active: active !== undefined ? active : true } },
        { new: true, upsert: true }
      );

      return updated!;
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
            { 'tagId.name': { $regex: search, $options: 'i' } },
            { 'tagId.description': { $regex: search, $options: 'i' } }
          ]
        };
      }

      const [interests, total] = await Promise.all([
        UserInterest.find(filter)
          .skip(skip)
          .limit(limit)
          .populate('userId', 'username email profilePicture')
          .populate('tagId', 'name type color description')
          .sort({ score: -1, createdAt: -1 }),
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
      .populate('userId', 'username email profilePicture')
      .populate('tagId', 'name type color description')
      .sort({ score: -1, createdAt: -1 });
   
    const total = await UserInterest.countDocuments();
    return { interests, total };
  }

  async getUserInterestById(id: string): Promise<IUserInterest | null> {
    return await UserInterest.findById(id)
      .populate('userId', 'username email profilePicture')
      .populate('tagId', 'name type color description');
  }

  async updateUserInterest(id: string, interestData: Partial<IUserInterest>): Promise<IUserInterest | null> {
    return await UserInterest.findByIdAndUpdate(
      id,
      interestData,
      { new: true }
    )
    .populate('userId', 'username email profilePicture')
    .populate('tagId', 'name type color description');
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

  async getUserInterestsByUser(userId: string): Promise<IUserInterest[]> {
    return await UserInterest.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      active: true 
    })
      .populate('tagId', 'name type color description')
      .sort({ score: -1, createdAt: -1 });
  }

  async getUserInterestsByTag(tagId: string): Promise<IUserInterest[]> {
    return await UserInterest.find({ 
      tagId: new mongoose.Types.ObjectId(tagId), 
      active: true 
    })
      .populate('userId', 'username email profilePicture')
      .sort({ score: -1, createdAt: -1 });
  }

  async userHasInterest(userId: string, tagId: string): Promise<boolean> {
    const existing = await UserInterest.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      tagId: new mongoose.Types.ObjectId(tagId)
    });
    return !!existing;
  }

  async updateInterestScore(userId: string, tagId: string, score: number): Promise<IUserInterest | null> {
    return await UserInterest.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        tagId: new mongoose.Types.ObjectId(tagId)
      },
      { score },
      { new: true, upsert: false } 
    );
  }

  async createOrUpdateUserInterest(userId: string, tagId: string, score: number): Promise<IUserInterest> {
    try {
      const existing = await UserInterest.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        tagId: new mongoose.Types.ObjectId(tagId)
      });

      if (existing) {
        return await this.updateInterestScore(userId, tagId, score) as IUserInterest;
      } else {
        return await this.createUserInterest({
          userId: new mongoose.Types.ObjectId(userId),
          tagId: new mongoose.Types.ObjectId(tagId),
          score,
          active: true
        });
      }
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async createInitialInterests(userId: string, interests: { tagId: string, score: number }[]): Promise<void> {
    try {
      for (const interest of interests) {
        await UserInterest.updateOne(
          {
            userId: new mongoose.Types.ObjectId(userId),
            tagId: new mongoose.Types.ObjectId(interest.tagId)
          },
          {
            $set: { score: interest.score, active: true }
          },
          { upsert: true }
        );
      }
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getUserInterestStats(): Promise<UserInterestStats> {
    const total = await UserInterest.countDocuments();
    const active = await UserInterest.countDocuments({ active: true });
    const inactive = await UserInterest.countDocuments({ active: false });
    const mostPopular = await UserInterest.aggregate([
      {
        $group: {
          _id: '$tagId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'tags',
          localField: '_id',
          foreignField: '_id',
          as: 'tagInfo'
        }
      },
      {
        $unwind: '$tagInfo'
      },
      {
        $project: {
          tagId: '$_id',
          count: 1,
          name: '$tagInfo.name',
          type: '$tagInfo.type'
        }
      }
    ]);

    return { 
      total, 
      active, 
      inactive, 
      mostPopular: mostPopular.map(item => ({
        tagId: item.tagId.toString(),
        count: item.count
      }))
    };
  }

  async getUserInterestStatsByUser(userId: string): Promise<{
    total: number;
    averageScore: number;
    byType: { type: string, count: number }[];
  }> {
    const userInterests = await this.getUserInterestsByUser(userId);
    
    const total = userInterests.length;
    
    const averageScore = total > 0 
      ? userInterests.reduce((sum, interest) => sum + interest.score, 0) / total
      : 0;

    const byType = userInterests.reduce((acc, interest) => {
      const tagType = (interest.tagId as any).type || 'Unknown';
      const existing = acc.find(item => item.type === tagType);
      
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: tagType, count: 1 });
      }
      
      return acc;
    }, [] as { type: string, count: number }[]);

    return {
      total,
      averageScore: Number(averageScore.toFixed(2)),
      byType
    };
  }
}