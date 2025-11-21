import { UserTrust, IUserTrust } from '../models/userTrust';
import mongoose from 'mongoose';

export interface UserTrustStats {
  average: number;
  count: number;
  distribution: { score: number, count: number }[];
}

export interface UserTrustSummary {
  userId: string;
  username: string;
  averageTrust: number;
  totalRatings: number;
  trustLevel: 'high' | 'medium' | 'low';
}

export class UserTrustService {
  async createTrustRating(trustData: Partial<IUserTrust>): Promise<IUserTrust> {
    try {
      const newTrust = new UserTrust(trustData);
      return await newTrust.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getTrustRatings(skip: number = 0, limit: number = 10, search?: string): Promise<{ratings: IUserTrust[], total: number}> {
    try {
      let filter: any = {};

      if (search) {
        if (mongoose.Types.ObjectId.isValid(search)) {
          filter = {
            $or: [
              { rater: new mongoose.Types.ObjectId(search) },
              { rated: new mongoose.Types.ObjectId(search) }
            ]
          };
        } else {
          filter = {
            $or: [
              { comment: { $regex: search, $options: 'i' } },
              { context: { $regex: search, $options: 'i' } }
            ]
          };
        }
      }

      const [ratings, total] = await Promise.all([
        UserTrust.find(filter)
          .skip(skip)
          .limit(limit)
          .populate('rater', 'username email')
          .populate('rated', 'username email')
          .sort({ createdAt: -1 }),
        UserTrust.countDocuments(filter)
      ]);

      return { ratings, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getTrustRatingById(id: string): Promise<IUserTrust | null> {
    return await UserTrust.findById(id)
      .populate('rater', 'username email')
      .populate('rated', 'username email');
  }

  async updateTrustRating(id: string, trustData: Partial<IUserTrust>): Promise<IUserTrust | null> {
    return await UserTrust.findByIdAndUpdate(
      id,
      trustData,
      { new: true }
    )
      .populate('rater', 'username email')
      .populate('rated', 'username email');
  }

  async getGlobalAverageTrust(): Promise<number> {
    const result = await UserTrust.aggregate([
      { $group: { _id: null, average: { $avg: '$score' } } }
    ]);
    return result.length > 0 ? Number(result[0].average.toFixed(2)) : 0;
  }

  async deleteTrustRating(id: string): Promise<IUserTrust | null> {
    return await UserTrust.findByIdAndDelete(id);
  }

  async getUserTrustStats(userId: string): Promise<UserTrustStats> {
    const result = await UserTrust.aggregate([
      { $match: { rated: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$rated',
          average: { $avg: '$score' },
          count: { $sum: 1 },
          distribution: {
            $push: '$score'
          }
        }
      }
    ]);

    if (result.length === 0) {
      return { average: 0, count: 0, distribution: [] };
    }

    const distribution = [1, 2, 3, 4, 5].map(score => ({
      score,
      count: result[0].distribution.filter((s: number) => s === score).length
    }));

    return {
      average: Number(result[0].average.toFixed(2)),
      count: result[0].count,
      distribution
    };
  }

  async getTrustRatingsByUser(userId: string): Promise<IUserTrust[]> {
    return await UserTrust.find({ rated: userId })
      .populate('rater', 'username email')
      .populate('rated', 'username email')
      .sort({ createdAt: -1 });
  }

  async getTrustRatingsFromUser(userId: string): Promise<IUserTrust[]> {
    return await UserTrust.find({ rater: userId })
      .populate('rater', 'username email')
      .populate('rated', 'username email')
      .sort({ createdAt: -1 });
  }

  async getUserTrustSummary(userId: string): Promise<UserTrustSummary> {
    const stats = await this.getUserTrustStats(userId);
    
    let trustLevel: 'high' | 'medium' | 'low' = 'medium';
    if (stats.average >= 4) trustLevel = 'high';
    else if (stats.average <= 2) trustLevel = 'low';

    return {
      userId,
      username: 'User', 
      averageTrust: stats.average,
      totalRatings: stats.count,
      trustLevel
    };
  }

  async getAllUsersTrustSummary(): Promise<UserTrustSummary[]> {
    const trustSummary = await UserTrust.aggregate([
      {
        $group: {
          _id: '$rated',
          averageTrust: { $avg: '$score' },
          totalRatings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          averageTrust: { $round: ['$averageTrust', 2] },
          totalRatings: 1,
          trustLevel: {
            $switch: {
              branches: [
                { case: { $gte: ['$averageTrust', 4] }, then: 'high' },
                { case: { $lte: ['$averageTrust', 2] }, then: 'low' }
              ],
              default: 'medium'
            }
          }
        }
      },
      { $sort: { averageTrust: -1 } }
    ]);

    return trustSummary;
  }

  async hasUserRated(raterId: string, ratedId: string, context: string): Promise<boolean> {
    const existingRating = await UserTrust.findOne({
      rater: raterId,
      rated: ratedId,
      context
    });
    return !!existingRating;
  }
}