import { Evento, IEvento } from '../models/evento';

export class EventoService {
  async createEvento(data: Partial<IEvento>): Promise<IEvento> {
    const e = new Evento(data);
    return await e.save();
  }

  async getAllEventos(skip: number = 0, limit: number = 10): Promise<{eventos: IEvento[], total: number}> {
    const eventos = await Evento.find({ active: true })
      .skip(skip)
      .limit(limit);
    
    const total = await Evento.countDocuments({ active: true });
    
    return { eventos, total };
  }

  async getAllEventosWithInactive(skip: number = 0, limit: number = 10): Promise<{eventos: IEvento[], total: number}> {
    const eventos = await Evento.find()
      .skip(skip)
      .limit(limit);
    
    const total = await Evento.countDocuments();
    
    return { eventos, total };
  }

  async getEventoById(id: string): Promise<IEvento | null> {
    return await Evento.findOne({ _id: id, active: true });
  }

  async disableEventoById(id: string): Promise<IEvento | null> {
    return await Evento.findByIdAndUpdate(
      id, 
      { active: false }, 
      { new: true }
    );
  }

  async reactivateEventoById(id: string): Promise<IEvento | null> {
    return await Evento.findByIdAndUpdate(
      id, 
      { active: true }, 
      { new: true }
    );
  }

  async deleteEventoById(id: string): Promise<IEvento | null> {
    return await Evento.findByIdAndDelete(id);
  }
}