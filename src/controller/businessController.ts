import { Request, Response } from 'express';
import { IBussines } from '../models/business';
import { BussinesService } from '../services/businessService';
import { validationResult } from 'express-validator';

const bussinesService = new BussinesService();

export async function createBussines(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, address, phone, email } = req.body as IBussines;
        const newBussines: Partial<IBussines> = { name, address, phone, email };
        const bussines = await bussinesService.createBussines(newBussines);
        return res.status(201).json(bussines);
    } catch {
        return res.status(500).json({ error: 'FALLO AL CREAR EL NEGOCIO' });
    }
}
export async function getAllBussines(req: Request, res: Response): Promise<Response> {
    try {   
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await bussinesService.getAllBussines(skip, limit);
        return res.status(200).json({
            bussines: result.bussines,
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
export async function getAllBussinesWithInactive(req: Request, res: Response): Promise<Response> {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await bussinesService.getAllBussinesWithInactive(skip, limit);
        return res.status(200).json({
            bussines: result.bussines,
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
export async function getBussinesById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const bussines = await bussinesService.getBussinesById(id);
        console.log(bussines);
        if (!bussines) {
            return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
        }
        return res.status(200).json(bussines);
    } catch (error) {
        return res.status(404).json({ message: (error as Error).message });
    }   
}
export async function disableBussinesById(req: Request, res: Response): Promise<Response> {
    try {   
        const { id } = req.params;
        const bussines = await bussinesService.disableBussinesById(id);
        if (!bussines) {
            return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
        }
        return res.status(200).json(bussines);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}
export async function reactivateBussinesById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const bussines = await bussinesService.reactivateBussinesById(id);
        if (!bussines) {
            return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
        }
        return res.status(200).json(bussines);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}
export async function deleteBussinesById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const bussines = await bussinesService.deleteBussinesById(id);
        if (!bussines) {
            return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
        }
        return res.status(200).json(bussines);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }   
}
export async function addEventoToBussines(req: Request, res: Response): Promise<Response> {
    try {
        const { bussinesId, eventoId } = req.params;
        const bussines = await bussinesService.addEventoToBussines(bussinesId, eventoId);
        if (!bussines) {
            return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
        }   
        return res.status(200).json(bussines);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }   

}

    export async function removeEventoFromBussines(req: Request, res: Response): Promise<Response> {
        try {
            const { bussinesId, eventoId } = req.params;
            const bussines = await bussinesService.removeEventoFromBussines(bussinesId, eventoId);
            if (!bussines) {
                return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
            }   
            return res.status(200).json(bussines);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }

}
export async function addManagerToBussines(req: Request, res: Response): Promise<Response> {
    try {
        const { bussinesId, managerId } = req.params;
        const bussines = await bussinesService.addManagerToBussines(bussinesId, managerId);
        if (!bussines) {
            return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
        }   
        return res.status(200).json(bussines);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}
export async function removeManagerFromBussines(req: Request, res: Response): Promise<Response> {
    try {
        const { bussinesId, managerId } = req.params;
        const bussines = await bussinesService.removeManagerFromBussines(bussinesId, managerId);
        if (!bussines) {
            return res.status(404).json({ message: 'NEGOCIO NO ENCONTRADO' });
        }
        return res.status(200).json(bussines);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}
