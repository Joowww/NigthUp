import { Tag, ITag } from '../models/tag';
import mongoose from 'mongoose';

export interface TagStats {
  total: number;
  active: number;
  inactive: number;
  mostUsed: { tag: ITag, count: number }[];
}

export class TagService {
  async createTag(tagData: Partial<ITag>): Promise<ITag> {
    try {
      const newTag = new Tag(tagData);
      return await newTag.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getAllTags(skip: number = 0, limit: number = 10, search?: string): Promise<{tags: ITag[], total: number}> {
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

      const [tags, total] = await Promise.all([
        Tag.find(filter)
          .skip(skip)
          .limit(limit)
          .populate('events', 'name schedule')
          .sort({ name: 1 }),
        Tag.countDocuments(filter)
      ]);

      return { tags, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getAllTagsWithInactive(skip: number = 0, limit: number = 10): Promise<{tags: ITag[], total: number}> {
    const tags = await Tag.find()
      .skip(skip)
      .limit(limit)
      .populate('events', 'name schedule')
      .sort({ name: 1 });
   
    const total = await Tag.countDocuments();
    return { tags, total };
  }

  async getTagById(id: string): Promise<ITag | null> {
    return await Tag.findById(id).populate('events', 'name schedule');
  }

  async getTagsByEvent(eventId: string): Promise<ITag[]> {
    try {
      return await Tag.find({ 
        events: eventId,
        active: true 
      })
      .populate('events', 'name schedule')
      .sort({ name: 1 });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getTagsByType(type: string): Promise<ITag[]> {
    try {
      return await Tag.find({ 
        type, 
        active: true 
      })
      .select('name type color description') 
      .sort({ name: 1 });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async updateTag(id: string, tagData: Partial<ITag>): Promise<ITag | null> {
    return await Tag.findByIdAndUpdate(
      id,
      tagData,
      { new: true }
    ).populate('events', 'name schedule');
  }

  async disableTag(id: string): Promise<ITag | null> {
    return await Tag.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
  }

  async reactivateTag(id: string): Promise<ITag | null> {
    return await Tag.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    );
  }

  async deleteTag(id: string): Promise<ITag | null> {
    return await Tag.findByIdAndDelete(id);
  }

  async addEventToTag(tagId: string, eventId: string): Promise<ITag | null> {
    return await Tag.findByIdAndUpdate(
      tagId,
      { $addToSet: { events: eventId } },
      { new: true }
    ).populate('events', 'name schedule');
  }

  async removeEventFromTag(tagId: string, eventId: string): Promise<ITag | null> {
    return await Tag.findByIdAndUpdate(
      tagId,
      { $pull: { events: eventId } },
      { new: true }
    ).populate('events', 'name schedule');
  }

  async getTagStats(): Promise<TagStats> {
    const total = await Tag.countDocuments();
    const active = await Tag.countDocuments({ active: true });
    const inactive = await Tag.countDocuments({ active: false });
    const mostUsed = await Tag.aggregate([
      {
        $project: {
          name: 1,
          description: 1,
          color: 1,
          eventCount: { $size: "$events" }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 5 }
    ]);

    return { total, active, inactive, mostUsed };
  }
}