import { User } from '../models/user';

export class UserStatusService {
  async setUserOnline(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date()
    });
  }

  async setUserOffline(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date()
    });
  }

  async updateLastSeen(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lastSeen: new Date()
    });
  }

  async getUserStatus(userId: string): Promise<{ isOnline: boolean; lastSeen: Date }> {
    const user = await User.findById(userId).select('isOnline lastSeen');
    if (!user) {
      throw new Error('User not found');
    }
    return {
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    };
  }

  async getFriendsWithStatus(userId: string): Promise<any[]> {
    return await User.find({
      _id: { $ne: userId },
      active: true
    }).select('username email isOnline lastSeen profilePicture');
  }
}