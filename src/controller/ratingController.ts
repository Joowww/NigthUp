import { Request, Response } from 'express';
import { IRating } from '../models/rating';
import { RatingService } from '../services/ratingServices';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

const ratingService = new RatingService();


export async function createRating(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando createRating controller');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { event, username, score, comment } = req.body;
    console.log('Datos recibidos:', { event, username, score, comment });


    if (score < 1 || score > 5) {
      console.log('Score inválido:', score);
      return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
    }

    if (!mongoose.Types.ObjectId.isValid(event)) {
      console.log('ID de evento inválido:', event);
      return res.status(400).json({ error: 'ID de evento inválido' });
    }

    const existingRating = await ratingService.getUserEventRating(username, event);
    if (existingRating) {
      console.log('El usuario ya valoró este evento');
      return res.status(400).json({ 
        error: 'Ya has valorado este evento',
        existingRating 
      });
    }

    const newRating: Partial<IRating> = { 
      event: new mongoose.Types.ObjectId(event), 
      username, 
      score, 
      comment 
    };
    const rating = await ratingService.createRating(newRating);
    
    console.log('Valoración creada exitosamente');
    return res.status(201).json(rating);
  } catch (error) {
    console.error('Error en createRating:', error);
    return res.status(500).json({ 
      error: 'Error al crear la valoración', 
      details: (error as Error).message 
    });
  }
}


export async function getRatings(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando getRatings controller');
  
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    console.log(`Parámetros - skip: ${skip}, limit: ${limit}, search: ${search}`);

    const result = await ratingService.getRatings(skip, limit, search);
    
    return res.status(200).json({
      ratings: result.ratings,
      pagination: {
        skip,
        limit,
        total: result.total,
        hasMore: (skip + limit) < result.total
      }
    });
  } catch (error) {
    console.error('Error en getRatings:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}


export async function getRatingById(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando getRatingById controller');
  
  try {
    const { id } = req.params;
    console.log(`ID solicitado: ${id}`);

    const rating = await ratingService.getRatingById(id);
    if (!rating) {
      console.log('Valoración no encontrada');
      return res.status(404).json({ message: 'Valoración no encontrada' });
    }

    console.log('valoración encontrada');
    return res.status(200).json(rating);
  } catch (error) {
    console.error('Error en getRatingById:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}


export async function updateRating(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando updateRating controller');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { score, comment } = req.body as Partial<IRating>;

    console.log(`Actualizando valoración ${id}:`, { score, comment });

    if (score && (score < 1 || score > 5)) {
      console.log('Score inválido:', score);
      return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
    }

    const updatedRating = await ratingService.updateRating(id, { score, comment });
    if (!updatedRating) {
      console.log('Valoración no encontrada para actualizar');
      return res.status(404).json({ message: 'Valoración no encontrada' });
    }

    console.log('Valoración actualizada exitosamente');
    return res.status(200).json(updatedRating);
  } catch (error) {
    console.error('Error en updateRating:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}


export async function deleteRating(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando deleteRating controller');
  
  try {
    const { id } = req.params;
    console.log(`Eliminando valoración: ${id}`);

    const rating = await ratingService.deleteRating(id);
    if (!rating) {
      console.log('Valoración no encontrada para eliminar');
      return res.status(404).json({ message: 'Valoración no encontrada' });
    }

    console.log('Valoración eliminada exitosamente');
    return res.status(200).json({ 
      message: 'Valoración eliminada correctamente',
      deletedRating: rating 
    });
  } catch (error) {
    console.error('Error en deleteRating:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}


export async function getEventRatingStats(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando getEventRatingStats controller');
  
  try {
    const { eventId } = req.params;
    console.log(`Obteniendo stats para evento: ${eventId}`);

    const stats = await ratingService.getEventRatingStats(eventId);
    
    console.log('Estadísticas obtenidas:', stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error en getEventRatingStats:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}


export async function getRatingsByEvent(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando getRatingsByEvent controller');
  
  try {
    const { eventId } = req.params;
    console.log(`Obteniendo valoraciones para evento: ${eventId}`);

    const ratings = await ratingService.getRatingsByEvent(eventId);
    
    console.log(`${ratings.length} valoraciones encontradas`);
    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error en getRatingsByEvent:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}


export async function getUserEventRating(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando getUserEventRating controller');
  
  try {
    const { username, eventId } = req.params;
    console.log(`Buscando valoración usuario ${username} - evento ${eventId}`);

    const rating = await ratingService.getUserEventRating(username, eventId);
    
    if (!rating) {
      console.log('ℹNo se encontró valoración para este usuario y evento');
      return res.status(404).json({ 
        message: 'No se encontró valoración para este usuario y evento' 
      });
    }

    console.log('Valoración encontrada');
    return res.status(200).json(rating);
  } catch (error) {
    console.error('Error en getUserEventRating:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}


export async function getRatingsByUser(req: Request, res: Response): Promise<Response> {
  console.log('Ejecutando getRatingsByUser controller');
  
  try {
    const { username } = req.params;
    console.log(`Obteniendo valoraciones para usuario: ${username}`);

    const ratings = await ratingService.getRatingsByUser(username);
    
    console.log(`${ratings.length} valoraciones encontradas para el usuario`);
    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error en getRatingsByUser:', error);
    return res.status(500).json({ 
      message: (error as Error).message 
    });
  }
}