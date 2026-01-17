import { Request, Response } from 'express';
import { MapService } from '../services/mapServices';
import Event from '../models/event';
import Business from '../models/business';

const mapService = new MapService();

export async function updateLocation(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    let coordinates: [number, number] | undefined = undefined;

    if (Array.isArray(req.body) && req.body.length === 2) {
      coordinates = [Number(req.body[0]), Number(req.body[1])];
    }
    else if (Array.isArray(req.body.coordinates) && req.body.coordinates.length === 2) {
      coordinates = [Number(req.body.coordinates[0]), Number(req.body.coordinates[1])];
    }
    else if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      coordinates = [Number(req.body.longitude), Number(req.body.latitude)];
    }
    else if (req.body.location?.coordinates && Array.isArray(req.body.location.coordinates)) {
      coordinates = [Number(req.body.location.coordinates[0]), Number(req.body.location.coordinates[1])];
    }

    if (!coordinates || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      return res.status(400).json({
        error: 'Invalid coordinates format. Expected [longitude, latitude], {longitude, latitude}, or GeoJSON object.',
        received: req.body
      });
    }

    await mapService.updateUserLocation(userId, coordinates);
    return res.status(200).json({
      message: 'Location updated successfully',
      location: {
        type: 'Point',
        coordinates
      }
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function setVisibility(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { isVisible } = req.body;

    await mapService.setUserVisibility(userId, isVisible);
    return res.status(200).json({ message: 'Visibility updated successfully', isVisible });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getNearbyUsers(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const radius = parseInt(req.query.radius as string) || 50000;
    const limit = 100;

    const users = await mapService.getNearbyUsers(userId, radius);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getFriendsNearby(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const radius = parseInt(req.query.radius as string) || 50000;

    const friends = await mapService.getFriendsNearby(userId, radius);
    return res.status(200).json(friends);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getNearbyEvents(req: Request, res: Response): Promise<Response> {
  try {
    const { eventId } = req.query;
    const radius = parseInt(req.query.radius as string) || 50000;
    const limit = 100;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }
    const event = await Event.findById(eventId);
    if (!event || !event.location || !Array.isArray(event.location.coordinates)) {
      return res.status(404).json({ error: 'Event not found or has no location' });
    }
    const coords = event.location.coordinates;
    const events = await mapService.getNearbyEvents(coords, radius);
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getNearbyBusinessesOnly(req: Request, res: Response): Promise<Response> {
  try {
    const { businessId } = req.query;
    const radius = parseInt(req.query.radius as string) || 50000;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }
    const business = await Business.findById(businessId);
    if (!business || !business.location || !Array.isArray(business.location.coordinates)) {
      return res.status(404).json({ error: 'Business not found or has no location' });
    }
    const coords = business.location.coordinates;
    const businesses = await mapService.getNearbyBusinesses(coords, radius);
    return res.status(200).json({ businesses });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}