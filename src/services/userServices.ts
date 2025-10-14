import { User, IUser } from '../models/user';
import { Event } from '../models/event';

export class UserService {
  async createUser(user: Partial<IUser>): Promise<IUser | null> {
    try {
      const newUser = new User(user);
      return await newUser.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getAllUsers(skip: number = 0, limit: number = 10): Promise<{users: IUser[], total: number}> {
    const users = await User.find({ active: true })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments({ active: true });
    
    return { users, total };
  }

  async getAllUsersWithInactive(skip: number = 0, limit: number = 10): Promise<{users: IUser[], total: number}> {
    const users = await User.find()
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();
    
    return { users, total };
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, active: true });
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username, active: true });
  }

  async updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { _id: id, active: true }, 
      user, 
      { new: true }
    );
  }

  async updateUserByUsername(username: string, user: Partial<IUser>): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { username, active: true }, 
      user, 
      { new: true }
    );
  }

  async disableUserById(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id, 
      { active: false }, 
      { new: true }
    );
  }

  async disableUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { username }, 
      { active: false }, 
      { new: true }
    );
  }

  async reactivateUserById(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id, 
      { active: true }, 
      { new: true }
    );
  }

  async reactivateUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { username }, 
      { active: true }, 
      { new: true }
    );
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
    );
    if (updatedUser) {
      await Event.findByIdAndUpdate(eventId, { $addToSet: { participants: userId } }, { new: true });
    }
    return updatedUser;
  }

  async loginUser(username: string, password: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ username, active: true });
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

  async loginAdmin(username: string, password: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ username, active: true, admin: true });
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
    const user = await User.findById(userId);
    return user ? user.admin : false;
  }

  // NEW: Create admin user directly
  async createAdminUser(userData: Partial<IUser>): Promise<IUser | null> {
    try {
      const adminUser = new User({
        ...userData,
        admin: true
      });
      return await adminUser.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Make existing user an admin
  async makeUserAdmin(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { admin: true },
      { new: true }
    );
  }

  // Remove admin permissions
  async removeUserAdmin(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { admin: false },
      { new: true }
    );
  }

  // Check if there is any admin in the system
  async hasAnyAdmin(): Promise<boolean> {
    const adminCount = await User.countDocuments({ admin: true, active: true });
    return adminCount > 0;
  }
}