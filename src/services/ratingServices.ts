import { Rating, IRating } from '../models/rating';
import mongoose from 'mongoose';

/**
 * Servicio para gestionar todas las operaciones de valoraciones
 */
export class RatingService {
  
  /**
   * Crear una nueva valoración
   * @param ratingData Datos de la valoración
   * @returns Promise con la valoración creada
   */
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

  /**
   * Obtener valoraciones con paginación y búsqueda
   * @param skip Número de registros a saltar
   * @param limit Límite de registros por página
   * @param search Término de búsqueda opcional
   * @returns Promise con array de valoraciones y total
   */
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

  /**
   * Obtener una valoración por ID
   * @param id ID de la valoración
   * @returns Promise con la valoración encontrada o null
   */
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

  /**
   * Actualizar una valoración
   * @param id ID de la valoración a actualizar
   * @param ratingData Nuevos datos de la valoración
   * @returns Promise con la valoración actualizada
   */
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

  /**
   * Eliminar una valoración
   * @param id ID de la valoración a eliminar
   * @returns Promise con la valoración eliminada
   */
  async deleteRating(id: string): Promise<IRating | null> {
    try {
      console.log(`🗑️ Eliminando valoración: ${id}`);
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

  /**
   * Obtener estadísticas de valoraciones para un evento
   * @param eventId ID del evento
   * @returns Promise con promedio y cantidad de valoraciones
   */
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

  /**
   * Obtener valoración de un usuario específico para un evento
   * @param username Username del usuario
   * @param eventId ID del evento
   * @returns Promise con la valoración encontrada o null
   */
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

  /**
   * Obtener todas las valoraciones de un evento específico
   * @param eventId ID del evento
   * @returns Promise con array de valoraciones del evento
   */
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

  /**
   * Obtener todas las valoraciones de un usuario específico
   * @param username Username del usuario
   * @returns Promise con array de valoraciones del usuario
   */
  async getRatingsByUser(username: string): Promise<IRating[]> {
    try {
      console.log(`🔍 Obteniendo valoraciones para usuario: ${username}`);
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