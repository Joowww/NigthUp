import { Request, Response } from 'express';
import { PanicButtonService } from '../services/panicButtonServices';

const panicButtonService = new PanicButtonService();

export async function activatePanicButton(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { coordinates, message } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Valid coordinates array [longitude, latitude] is required' });
    }

    const panicButton = await panicButtonService.activatePanicButton(userId, coordinates as [number, number], message);
    return res.status(201).json(panicButton);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function getPanicButtonHistory(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const history = await panicButtonService.getPanicButtonHistory(userId);
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function addEmergencyContact(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    await panicButtonService.addEmergencyContact(userId, phoneNumber);
    return res.status(200).json({ message: 'Emergency contact added successfully' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export async function removeEmergencyContact(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    await panicButtonService.removeEmergencyContact(userId, phoneNumber);
    return res.status(200).json({ message: 'Emergency contact removed successfully' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}