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
      const newInterest = new UserInterest(interestData);
      return await newInterest.save();
    } catch (error) {
      // Manejar error de duplicado
      if ((error as any).code === 11000) {
        throw new Error('User already has this interest');
      }
      throw new Error((error as Error).message);
    }
  }

  async getAllUserInterests(skip: number = 0, limit: number = 10, search?: string): Promise<{interests: IUserInterest[], total: number}> {
    try {
      let filter: any = { active: true };

      if (search) {
        // Buscar a través de la población de tags
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

  // NUEVO: Obtener intereses por usuario específico
  async getUserInterestsByUser(userId: string): Promise<IUserInterest[]> {
    return await UserInterest.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      active: true 
    })
      .populate('tagId', 'name type color description')
      .sort({ score: -1, createdAt: -1 });
  }

  // NUEVO: Obtener intereses por tag específico
  async getUserInterestsByTag(tagId: string): Promise<IUserInterest[]> {
    return await UserInterest.find({ 
      tagId: new mongoose.Types.ObjectId(tagId), 
      active: true 
    })
      .populate('userId', 'username email profilePicture')
      .sort({ score: -1, createdAt: -1 });
  }

  // NUEVO: Verificar si usuario ya tiene un interés
  async userHasInterest(userId: string, tagId: string): Promise<boolean> {
    const existing = await UserInterest.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      tagId: new mongoose.Types.ObjectId(tagId)
    });
    return !!existing;
  }

  // NUEVO: Actualizar score de interés existente
  async updateInterestScore(userId: string, tagId: string, score: number): Promise<IUserInterest | null> {
    return await UserInterest.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        tagId: new mongoose.Types.ObjectId(tagId)
      },
      { score },
      { new: true, upsert: false } // No crear nuevo, solo actualizar existente
    );
  }

  // NUEVO: Crear o actualizar interés
  async createOrUpdateUserInterest(userId: string, tagId: string, score: number): Promise<IUserInterest> {
    try {
      const existing = await UserInterest.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        tagId: new mongoose.Types.ObjectId(tagId)
      });

      if (existing) {
        // Actualizar existente
        return await this.updateInterestScore(userId, tagId, score) as IUserInterest;
      } else {
        // Crear nuevo
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

  // NUEVO: Para onboarding - crear múltiples intereses iniciales
  async createInitialInterests(userId: string, interests: { tagId: string, score: number }[]): Promise<void> {
    try {
      const interestPromises = interests.map(interest => 
        this.createOrUpdateUserInterest(
          userId, 
          interest.tagId, 
          interest.score
        )
      );
      
      await Promise.all(interestPromises);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // NUEVO: Estadísticas corregidas
  async getUserInterestStats(): Promise<UserInterestStats> {
    const total = await UserInterest.countDocuments();
    const active = await UserInterest.countDocuments({ active: true });
    const inactive = await UserInterest.countDocuments({ active: false });

    // Obtener tags más populares (con más usuarios)
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

  // NUEVO: Obtener estadísticas de usuario específico
  async getUserInterestStatsByUser(userId: string): Promise<{
    total: number;
    averageScore: number;
    byType: { type: string, count: number }[];
  }> {
    const userInterests = await this.getUserInterestsByUser(userId);
    
    const total = userInterests.length;
    
    // Calcular score promedio
    const averageScore = total > 0 
      ? userInterests.reduce((sum, interest) => sum + interest.score, 0) / total
      : 0;

    // Agrupar por tipo de tag
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