import { Rating, IRating } from '../models/rating';
import mongoose from 'mongoose';

export class RatingService {

  async createRating(ratingData: Partial<IRating>): Promise<IRating> {
    try {
      const rating = new Rating(ratingData);
      const savedRating = await rating.save();
      return savedRating;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getRatings(skip: number = 0, limit: number = 10, search?: string): Promise<{ ratings: IRating[], total: number }> {
    try {

      let filter = {};

      if (search) {
        if (mongoose.Types.ObjectId.isValid(search)) {
          filter = { event: new mongoose.Types.ObjectId(search) };
        } else {
          filter = {
            $or: [
              { comment: { $regex: search, $options: 'i' } },
              { username: { $regex: search, $options: 'i' } }
            ]
          };
        }
      }

      const [ratings, total] = await Promise.all([
        Rating.find(filter)
          .skip(skip)
          .limit(limit)
          .populate('event', 'name schedule location')
          .sort({ createdAt: -1 }),
        Rating.countDocuments(filter)
      ]);

      return { ratings, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getRatingById(id: string): Promise<IRating | null> {
    try {
      const rating = await Rating.findById(id)
        .populate('event', 'name schedule location');

      return rating;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async updateRating(id: string, ratingData: Partial<IRating>): Promise<IRating | null> {
    try {
      const updatedRating = await Rating.findByIdAndUpdate(
        id,
        ratingData,
        { new: true }
      )
        .populate('event', 'name schedule location');

      return updatedRating;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async deleteRating(id: string): Promise<IRating | null> {
    try {
      const deletedRating = await Rating.findByIdAndDelete(id);

      return deletedRating;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getEventRatingStats(eventId: string): Promise<{ average: number, count: number }> {
    try {

      const result = await Rating.aggregate([
        { $match: { event: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: '$event',
            average: { $avg: '$score' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (result.length === 0) {
        return { average: 0, count: 0 };
      }

      const stats = {
        average: Number(result[0].average.toFixed(2)),
        count: result[0].count
      };

      return stats;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getUserEventRating(username: string, eventId: string): Promise<IRating | null> {
    try {
      const rating = await Rating.findOne({
        username: username,
        event: eventId
      })
        .populate('event', 'name schedule location');

      return rating;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getRatingsByEvent(eventId: string): Promise<IRating[]> {
    try {
      const ratings = await Rating.find({ event: eventId })
        .populate('event', 'name schedule location')
        .sort({ createdAt: -1 });

      return ratings;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getRatingsByUser(username: string): Promise<IRating[]> {
    try {
      const ratings = await Rating.find({ username: username })
        .populate('event', 'name schedule location')
        .sort({ createdAt: -1 });

      return ratings;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}