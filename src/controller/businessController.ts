import { Request, Response } from 'express';
import { IBusiness } from '../models/business';
import { BusinessService } from '../services/businessService';
import { validationResult } from 'express-validator';

const businessService = new BusinessService();

export async function createBusiness(req: Request, res: Response): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, address, phone, email } = req.body as IBusiness;
    const newBusiness: Partial<IBusiness> = { name, address, phone, email };
    const business = await businessService.createBusiness(newBusiness);
    return res.status(201).json(business);
  } catch (error) {
    return res.status(500).json({ error: 'FALLO AL CREAR EL NEGOCIO', details: (error as Error).message });
  }
}

export async function getAllBusinesses(req: Request, res: Response): Promise<Response> {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await businessService.getAllBusinesses(skip, limit);
    return res.status(200).json({
      businesses: result.businesses,
      pagination: {
        skip,
        limit,
        total: result.total,
        hasMore: (skip + limit) < result.total
      }
    });
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function getAllBusinessesWithInactive(req: Request, res: Response): Promise<Response> {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await businessService.getAllBusinessesWithInactive(skip, limit);
    return res.status(200).json({
      businesses: result.businesses,
      pagination: {
        skip,
        limit,
        total: result.total,
        hasMore: (skip + limit) < result.total
      }
    });
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function getBusinessById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const business = await businessService.getBusinessById(id);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function disableBusinessById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const business = await businessService.disableBusinessById(id);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function reactivateBusinessById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const business = await businessService.reactivateBusinessById(id);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteBusinessById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const business = await businessService.deleteBusinessById(id);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function addEventToBusiness(req: Request, res: Response): Promise<Response> {
  try {
    const { businessId, eventId } = req.params;
    const business = await businessService.addEventToBusiness(businessId, eventId);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function removeEventFromBusiness(req: Request, res: Response): Promise<Response> {
  try {
    const { businessId, eventId } = req.params;
    const business = await businessService.removeEventFromBusiness(businessId, eventId);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function addManagerToBusiness(req: Request, res: Response): Promise<Response> {
  try {
    const { businessId, managerId } = req.params;
    const business = await businessService.addManagerToBusiness(businessId, managerId);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function removeManagerFromBusiness(req: Request, res: Response): Promise<Response> {
  try {
    const { businessId, managerId } = req.params;
    const business = await businessService.removeManagerFromBusiness(businessId, managerId);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function updateBusiness(req: Request, res: Response): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { name, address, phone, email } = req.body as IBusiness;
    const updatedBusiness: Partial<IBusiness> = { name, address, phone, email };
    const business = await businessService.updateBusiness(id, updatedBusiness);
    if (!business) {
      return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
    }
    return res.status(200).json(business);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}