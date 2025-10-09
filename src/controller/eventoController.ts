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
    const eventos = await eventoService.getAllEventos();
    return res.status(200).json(eventos);
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

export async function deleteEventoById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;

    const toDelete = await Evento.findById(id).lean().exec();
    if (!toDelete) return res.status(404).json({ message: 'EVENTO NO ENCONTRADO' });

    if (Array.isArray(toDelete.participantes) && toDelete.participantes.length > 0) {
      await Usuario.updateMany(
        { _id: { $in: toDelete.participantes } },
        { $pull: { eventos: toDelete._id } }
      ).exec();
    }

    const deleted = await eventoService.deleteEventoById(id);
    return res.status(200).json(deleted);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}