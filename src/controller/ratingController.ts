import { Request, Response } from 'express';
import { IRating } from '../models/rating';
import { RatingService } from '../services/ratingServices';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

const ratingService = new RatingService();


export async function createRating(req: Request, res: Response): Promise<Response> {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { event, username, score, comment } = req.body;


    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
    }

    if (!mongoose.Types.ObjectId.isValid(event)) {
      return res.status(400).json({ error: 'ID de evento inválido' });
    }

    const existingRating = await ratingService.getUserEventRating(username, event);
    if (existingRating) {
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

    return res.status(201).json(rating);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al crear la valoración',
      details: (error as Error).message
    });
  }
}


export async function getRatings(req: Request, res: Response): Promise<Response> {

  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

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
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}


export async function getRatingById(req: Request, res: Response): Promise<Response> {

  try {
    const { id } = req.params;

    const rating = await ratingService.getRatingById(id);
    if (!rating) {
      return res.status(404).json({ message: 'Valoración no encontrada' });
    }

    return res.status(200).json(rating);
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}


export async function updateRating(req: Request, res: Response): Promise<Response> {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { score, comment } = req.body as Partial<IRating>;

    if (score && (score < 1 || score > 5)) {
      return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
    }

    const updatedRating = await ratingService.updateRating(id, { score, comment });
    if (!updatedRating) {
      return res.status(404).json({ message: 'Valoración no encontrada' });
    }

    return res.status(200).json(updatedRating);
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}


export async function deleteRating(req: Request, res: Response): Promise<Response> {

  try {
    const { id } = req.params;

    const rating = await ratingService.deleteRating(id);
    if (!rating) {
      return res.status(404).json({ message: 'Valoración no encontrada' });
    }

    return res.status(200).json({
      message: 'Valoración eliminada correctamente',
      deletedRating: rating
    });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}


export async function getEventRatingStats(req: Request, res: Response): Promise<Response> {

  try {
    const { eventId } = req.params;

    const stats = await ratingService.getEventRatingStats(eventId);

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}


export async function getRatingsByEvent(req: Request, res: Response): Promise<Response> {

  try {
    const { eventId } = req.params;

    const ratings = await ratingService.getRatingsByEvent(eventId);

    return res.status(200).json(ratings);
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}


export async function getUserEventRating(req: Request, res: Response): Promise<Response> {

  try {
    const { username, eventId } = req.params;

    const rating = await ratingService.getUserEventRating(username, eventId);

    if (!rating) {
      return res.status(404).json({
        message: 'No se encontró valoración para este usuario y evento'
      });
    }

    return res.status(200).json(rating);
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}


export async function getRatingsByUser(req: Request, res: Response): Promise<Response> {

  try {
    const { username } = req.params;

    const ratings = await ratingService.getRatingsByUser(username);

    return res.status(200).json(ratings);
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message
    });
  }
}