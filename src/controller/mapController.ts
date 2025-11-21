import { Request, Response } from 'express';
import { MapService } from '../services/mapServices';

const mapService = new MapService();

export async function updateLocation(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Valid coordinates array [longitude, latitude] is required' });
    }

    await mapService.updateUserLocation(userId, coordinates as [number, number]);
    return res.status(200).json({ message: 'Location updated successfully' });
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
    const { radius } = req.query;

    const users = await mapService.getNearbyUsers(userId, parseInt(radius as string) || 10000);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getNearbyBusinesses(req: Request, res: Response): Promise<Response> {
  try {
    const { coordinates, radius } = req.query;

    if (!coordinates) {
      return res.status(400).json({ error: 'Coordinates are required' });
    }

    const coords = (coordinates as string).split(',').map(Number);
    const businesses = await mapService.getNearbyBusinesses([coords[0], coords[1]], parseInt(radius as string) || 5000);
    return res.status(200).json(businesses);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getFriendsNearby(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { radius } = req.query;

    const friends = await mapService.getFriendsNearby(userId, parseInt(radius as string) || 10000);
    return res.status(200).json(friends);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}