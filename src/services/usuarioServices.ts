import { Usuario, IUsuario } from '../models/usuario';
import { Evento } from '../models/evento';

export class UserService {
  async createUser(user: Partial<IUsuario>): Promise<IUsuario | null> {
    try {
      const newUser = new Usuario(user);
      return await newUser.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getAllUsers(skip: number = 0, limit: number = 10): Promise<{users: IUsuario[], total: number}> {
    const users = await Usuario.find({ active: true })
      .skip(skip)
      .limit(limit);
    
    const total = await Usuario.countDocuments({ active: true });
    
    return { users, total };
  }

  async getAllUsersWithInactive(skip: number = 0, limit: number = 10): Promise<{users: IUsuario[], total: number}> {
    const users = await Usuario.find()
      .skip(skip)
      .limit(limit);
    
    const total = await Usuario.countDocuments();
    
    return { users, total };
  }

  async getUserById(id: string): Promise<IUsuario | null> {
    return await Usuario.findOne({ _id: id, active: true });
  }

  async getUserByUsername(username: string): Promise<IUsuario | null> {
    return await Usuario.findOne({ username, active: true });
  }

  async updateUserById(id: string, user: Partial<IUsuario>): Promise<IUsuario | null> {
    return await Usuario.findOneAndUpdate(
      { _id: id, active: true }, 
      user, 
      { new: true }
    );
  }

  async updateUserByUsername(username: string, user: Partial<IUsuario>): Promise<IUsuario | null> {
    return await Usuario.findOneAndUpdate(
      { username, active: true }, 
      user, 
      { new: true }
    );
  }

  async disableUserById(id: string): Promise<IUsuario | null> {
    return await Usuario.findByIdAndUpdate(
      id, 
      { active: false }, 
      { new: true }
    );
  }

  async disableUserByUsername(username: string): Promise<IUsuario | null> {
    return await Usuario.findOneAndUpdate(
      { username }, 
      { active: false }, 
      { new: true }
    );
  }

  async reactivateUserById(id: string): Promise<IUsuario | null> {
    return await Usuario.findByIdAndUpdate(
      id, 
      { active: true }, 
      { new: true }
    );
  }

  async reactivateUserByUsername(username: string): Promise<IUsuario | null> {
    return await Usuario.findOneAndUpdate(
      { username }, 
      { active: true }, 
      { new: true }
    );
  }

  async deleteUserById(id: string): Promise<IUsuario | null> {
    return await Usuario.findByIdAndDelete(id);
  }

  async deleteUserByUsername(username: string): Promise<IUsuario | null> {
    return await Usuario.findOneAndDelete({ username });
  }

  async addEventToUser(userId: string, eventId: string): Promise<IUsuario | null> {
    const updatedUser = await Usuario.findByIdAndUpdate(
      userId,
      { $addToSet: { eventos: eventId } },
      { new: true }
    );
    if (updatedUser) {
      await Evento.findByIdAndUpdate(eventId, { $addToSet: { participantes: userId } }, { new: true });
    }
    return updatedUser;
  }

  async loginUser(username: string, password: string): Promise<IUsuario | null> {
    try {
      const user = await Usuario.findOne({ username, active: true });
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return null;
      }
      
      return user;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async loginAdmin(username: string, password: string): Promise<IUsuario | null> {
    try {
      const user = await Usuario.findOne({ username, active: true, admin: true });
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return null;
      }
      
      return user;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const user = await Usuario.findById(userId);
    return user ? user.admin : false;
  }

  // NUEVO: Crear usuario admin directamente
  async createAdminUser(userData: Partial<IUsuario>): Promise<IUsuario | null> {
    try {
      const adminUser = new Usuario({
        ...userData,
        admin: true
      });
      return await adminUser.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Hacer admin a un usuario existente
  async makeUserAdmin(userId: string): Promise<IUsuario | null> {
    return await Usuario.findByIdAndUpdate(
      userId,
      { admin: true },
      { new: true }
    );
  }

  // Quitar permisos de admin
  async removeUserAdmin(userId: string): Promise<IUsuario | null> {
    return await Usuario.findByIdAndUpdate(
      userId,
      { admin: false },
      { new: true }
    );
  }

  // Verificar si existe al menos un admin en el sistema
  async hasAnyAdmin(): Promise<boolean> {
    const adminCount = await Usuario.countDocuments({ admin: true, active: true });
    return adminCount > 0;
  }
}