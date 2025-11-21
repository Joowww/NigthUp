import { Rating, IRating } from '../models/rating';
import mongoose from 'mongoose';

export class RatingService {
  
  async createRating(ratingData: Partial<IRating>): Promise<IRating> {
    try {
      console.log('Creando nueva valoración:', ratingData);
      const rating = new Rating(ratingData);
      const savedRating = await rating.save();
      console.log('Valoración creada exitosamente:', savedRating._id);
      return savedRating;
    } catch (error) {
      console.error('Error al crear valoración:', error);
      throw new Error((error as Error).message);
    }
  }

  async getRatings(skip: number = 0, limit: number = 10, search?: string): Promise<{ ratings: IRating[], total: number }> {
    try {
      console.log(`Buscando valoraciones - skip: ${skip}, limit: ${limit}, search: ${search}`);
      
      let filter = {};

      if (search) {
        if (mongoose.Types.ObjectId.isValid(search)) {
          filter = { event: new mongoose.Types.ObjectId(search) };
          console.log('Búsqueda por ID de evento:', search);
        } else {
          filter = {
            $or: [
              { comment: { $regex: search, $options: 'i' } },
              { username: { $regex: search, $options: 'i' } }
            ]
          };
          console.log('Búsqueda por texto:', search);
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

      console.log(`Encontradas ${ratings.length} valoraciones de ${total} totales`);
      return { ratings, total };
    } catch (error) {
      console.error('Error al obtener valoraciones:', error);
      throw new Error((error as Error).message);
    }
  }

  async getRatingById(id: string): Promise<IRating | null> {
    try {
      console.log(`Buscando valoración por ID: ${id}`);
      const rating = await Rating.findById(id)
        .populate('event', 'name schedule location');
      
      if (!rating) {
        console.log('Valoración no encontrada');
      } else {
        console.log('Valoración encontrada');
      }
      return rating;
    } catch (error) {
      console.error('Error al obtener valoración por ID:', error);
      throw new Error((error as Error).message);
    }
  }

  async updateRating(id: string, ratingData: Partial<IRating>): Promise<IRating | null> {
    try {
      console.log(`Actualizando valoración ${id}:`, ratingData);
      const updatedRating = await Rating.findByIdAndUpdate(
        id, 
        ratingData, 
        { new: true }
      )
        .populate('event', 'name schedule location');
      
      if (!updatedRating) {
        console.log('Valoración no encontrada para actualizar');
      } else {
        console.log('Valoración actualizada exitosamente');
      }
      return updatedRating;
    } catch (error) {
      console.error('Error al actualizar valoración:', error);
      throw new Error((error as Error).message);
    }
  }

  async deleteRating(id: string): Promise<IRating | null> {
    try {
      console.log(`Eliminando valoración: ${id}`);
      const deletedRating = await Rating.findByIdAndDelete(id);
      
      if (!deletedRating) {
        console.log('Valoración no encontrada para eliminar');
      } else {
        console.log('Valoración eliminada exitosamente');
      }
      return deletedRating;
    } catch (error) {
      console.error('Error al eliminar valoración:', error);
      throw new Error((error as Error).message);
    }
  }

  async getEventRatingStats(eventId: string): Promise<{ average: number, count: number }> {
    try {
      console.log(`Obteniendo estadísticas para evento: ${eventId}`);
      
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
        console.log('ℹNo hay valoraciones para este evento');
        return { average: 0, count: 0 };
      }

      const stats = { 
        average: Number(result[0].average.toFixed(2)), 
        count: result[0].count 
      };
      
      console.log(`Estadísticas obtenidas:`, stats);
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error((error as Error).message);
    }
  }

  async getUserEventRating(username: string, eventId: string): Promise<IRating | null> {
    try {
      console.log(`Buscando valoración de usuario ${username} para evento ${eventId}`);
      const rating = await Rating.findOne({ 
        username: username, 
        event: eventId 
      })
        .populate('event', 'name schedule location');
      
      if (rating) {
        console.log('Valoración encontrada');
      } else {
        console.log('ℹNo se encontró valoración para este usuario y evento');
      }
      return rating;
    } catch (error) {
      console.error('Error al buscar valoración usuario-evento:', error);
      throw new Error((error as Error).message);
    }
  }

  async getRatingsByEvent(eventId: string): Promise<IRating[]> {
    try {
      console.log(`Obteniendo valoraciones para evento: ${eventId}`);
      const ratings = await Rating.find({ event: eventId })
        .populate('event', 'name schedule location')
        .sort({ createdAt: -1 });
      
      console.log(`Encontradas ${ratings.length} valoraciones para el evento`);
      return ratings;
    } catch (error) {
      console.error('Error al obtener valoraciones por evento:', error);
      throw new Error((error as Error).message);
    }
  }

  async getRatingsByUser(username: string): Promise<IRating[]> {
    try {
      console.log(`Obteniendo valoraciones para usuario: ${username}`);
      const ratings = await Rating.find({ username: username })
        .populate('event', 'name schedule location')
        .sort({ createdAt: -1 });
      
      console.log(`Encontradas ${ratings.length} valoraciones para el usuario`);
      return ratings;
    } catch (error) {
      console.error('Error al obtener valoraciones por usuario:', error);
      throw new Error((error as Error).message);
    }
  }
}