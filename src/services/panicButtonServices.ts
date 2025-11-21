import { PanicButton, IPanicButton } from '../models/panicButton';
import { User } from '../models/user';

export class PanicButtonService {
  async activatePanicButton(userId: string, coordinates: [number, number], message?: string): Promise<IPanicButton> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const panicButton = new PanicButton({
      userId,
      location: {
        type: 'Point',
        coordinates
      },
      emergencyContacts: ['112'], // Número de emergencia por defecto
      message
    });

    // En una implementación real, aquí enviarías notificaciones a contactos de emergencia
    console.log('🚨 PANIC BUTTON ACTIVATED');
    console.log('User:', user.username);
    console.log('Location:', coordinates);
    console.log('Emergency contacts to notify:', panicButton.emergencyContacts);

    return await panicButton.save();
  }

  async getPanicButtonHistory(userId: string): Promise<IPanicButton[]> {
    return await PanicButton.find({ userId }).sort({ activatedAt: -1 });
  }

  async addEmergencyContact(userId: string, phoneNumber: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { emergencyContacts: phoneNumber }
    });
  }

  async removeEmergencyContact(userId: string, phoneNumber: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { emergencyContacts: phoneNumber }
    });
  }
}