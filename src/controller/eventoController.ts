import { Request, Response } from 'express';
import { EventoService } from '../services/eventoServices';
import { Usuario } from '../models/usuario';
import { Evento } from '../models/evento';

const eventoService = new EventoService();

function normalizeSchedule(s: any): string {
  if (Array.isArray(s)) return s[0] || '';
  return s || '';
}

function normalizeParticipantes(p: any): string[] {
  if (Array.isArray(p)) return p.filter(Boolean);
  if (Array.isArray((p || {}).participants)) return (p.participants as any[]).filter(Boolean) as string[];
  return [];
}

export async function createEvento(req: Request, res: Response): Promise<Response> {
  try {
    const { name, schedule, address, participantes } = req.body;
    const scheduleStr = normalizeSchedule(schedule);
    const participantesIds = normalizeParticipantes(participantes);

    const created = await eventoService.createEvento({
      name,
      schedule: scheduleStr,
      address,
      participantes: participantesIds as any
    });

    if (participantesIds.length > 0) {
      await Usuario.updateMany(
        { _id: { $in: participantesIds } },
        { $addToSet: { eventos: created._id } }
      ).exec();
    }

    const populated = await Evento.findById(created._id)
      .populate('participantes', 'username gmail')
      .exec();

    return res.status(201).json(populated ?? created);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function getAllEventos(req: Request, res: Response): Promise<Response> {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await eventoService.getAllEventos(skip, limit);
    return res.status(200).json({
      eventos: result.eventos,
      pagination: {
        skip,
        limit,
        total: result.total,
        hasMore: (skip + limit) < result.total
      }
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function getAllEventosWithInactive(req: Request, res: Response): Promise<Response> {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await eventoService.getAllEventosWithInactive(skip, limit);
    return res.status(200).json({
      eventos: result.eventos,
      pagination: {
        skip,
        limit,
        total: result.total,
        hasMore: (skip + limit) < result.total
      }
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function getEventoById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const evento = await eventoService.getEventoById(id);
    if (!evento) return res.status(404).json({ message: 'EVENTO NO ENCONTRADO' });
    return res.status(200).json(evento);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function disableEventoById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const disabledEvento = await eventoService.disableEventoById(id);
    if (!disabledEvento) return res.status(404).json({ message: 'EVENTO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Evento deshabilitado correctamente',
      evento: disabledEvento 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function reactivateEventoById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const reactivatedEvento = await eventoService.reactivateEventoById(id);
    if (!reactivatedEvento) return res.status(404).json({ message: 'EVENTO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Evento reactivado correctamente',
      evento: reactivatedEvento 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteEventoById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const deletedEvento = await eventoService.deleteEventoById(id);
    if (!deletedEvento) return res.status(404).json({ message: 'EVENTO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Evento eliminado permanentemente',
      evento: deletedEvento 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}