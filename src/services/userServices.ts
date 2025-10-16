import { User, IUser } from '../models/user';
import { Event } from '../models/event';

export class UserService {
  async createUser(userData: Partial<IUser>): Promise<IUser | null> {
    try {
      const newUser = new User(userData);
      return await newUser.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getAllUsers(skip: number = 0, limit: number = 10): Promise<{users: IUser[], total: number}> {
    const users = await User.find({ active: true })
      .skip(skip)
      .limit(limit)
      .populate('events', 'name schedule')
      .select('-password');
    
    const total = await User.countDocuments({ active: true });
    return { users, total };
  }

  async getAllUsersWithInactive(skip: number = 0, limit: number = 10): Promise<{users: IUser[], total: number}> {
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .populate('events', 'name schedule')
      .select('-password');
    
    const total = await User.countDocuments();
    return { users, total };
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, active: true })
      .populate('events', 'name schedule')
      .select('-password');
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username, active: true })
      .populate('events', 'name schedule')
      .select('-password');
  }

  async updateUserById(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    // No permitir actualizar el rol a admin desde aquí
    if (userData.role === 'admin') {
      throw new Error('Cannot update role to admin from this service');
    }

    if (userData.password) {
      throw new Error('Password cannot be updated from this service');
    }

    return await User.findOneAndUpdate(
      { _id: id, active: true }, 
      userData, 
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async updateUserByUsername(username: string, userData: Partial<IUser>): Promise<IUser | null> {
    // No permitir actualizar el rol a admin desde aquí
    if (userData.role === 'admin') {
      throw new Error('Cannot update role to admin from this service');
    }

    if (userData.password) {
      throw new Error('Password cannot be updated from this service');
    }

    return await User.findOneAndUpdate(
      { username, active: true }, 
      userData, 
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async disableUserById(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id, 
      { active: false }, 
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async disableUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { username }, 
      { active: false }, 
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async reactivateUserById(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id, 
      { active: true }, 
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async reactivateUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { username }, 
      { active: true }, 
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async deleteUserById(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }

  async deleteUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOneAndDelete({ username });
  }

  async addEventToUser(userId: string, eventId: string): Promise<IUser | null> {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { events: eventId } },
      { new: true }
    ).populate('events', 'name schedule').select('-password');
    
    if (updatedUser) {
      await Event.findByIdAndUpdate(
        eventId, 
        { $addToSet: { participants: userId } }, 
        { new: true }
      );
    }
    return updatedUser;
  }

  async loginUser(username: string, password: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ username, active: true })
        .populate('events', 'name schedule');
      
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

  async makeUserAdmin(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { role: 'admin' },
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async removeUserAdmin(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { role: 'user' },
      { new: true }
    ).populate('events', 'name schedule').select('-password');
  }

  async removeEventFromUser(userId: string, eventId: string): Promise<IUser | null> {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { events: eventId } },
      { new: true }
    ).populate('events', 'name schedule').select('-password');
    
    if (updatedUser) {
      await Event.findByIdAndUpdate(
        eventId, 
        { $pull: { participants: userId } }, 
        { new: true }
      );
    }
    return updatedUser;
  }

  async hasAnyAdmin(): Promise<boolean> {
    const adminCount = await User.countDocuments({ role: 'admin', active: true });
    return adminCount > 0;
  }
}