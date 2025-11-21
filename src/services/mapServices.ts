import { User } from '../models/user';
import { Business } from '../models/business';
import { Event } from '../models/event';
import { Friendship } from '../models/friendship';
import mongoose from 'mongoose';

export interface MapItem {
  id: string;
  type: 'user' | 'business' | 'event';
  coordinates: [number, number];
  name: string;
  data: any;
}

export class MapService {
  async updateUserLocation(userId: string, coordinates: [number, number]): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      location: {
        type: 'Point',
        coordinates
      },
      lastLocationUpdate: new Date()
    });
  }

  async setUserVisibility(userId: string, isVisible: boolean): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isVisibleOnMap: isVisible
    });
  }

  async getNearbyUsers(userId: string, radiusInMeters: number = 10000): Promise<any[]> {
    const user = await User.findById(userId);
    if (!user || !user.location) {
      return [];
    }

    return await User.find({
      _id: { $ne: userId },
      isVisibleOnMap: true,
      location: {
        $near: {
          $geometry: user.location,
          $maxDistance: radiusInMeters
        }
      }
    }).select('username email location profilePicture isOnline lastSeen');
  }

  async getNearbyBusinesses(coordinates: [number, number], radiusInMeters: number = 5000): Promise<any[]> {
    return await Business.find({
      active: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('events', 'name schedule').populate('managers', 'username email');
  }

  async getNearbyEvents(coordinates: [number, number], radiusInMeters: number = 5000): Promise<any[]> {
    return await Event.find({
      active: true,
      schedule: { $gte: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('participants', 'username profilePicture');
  }

  async getFriendsNearby(userId: string, radiusInMeters: number = 10000): Promise<any[]> {
    const user = await User.findById(userId);
    if (!user || !user.location) {
      return [];
    }

    // Obtener amigos usando el servicio real de amigos
    const friendIds = await this.getUserFriendIds(userId);

    return await User.find({
      _id: { $in: friendIds },
      isVisibleOnMap: true,
      location: {
        $near: {
          $geometry: user.location,
          $maxDistance: radiusInMeters
        }
      }
    }).select('username email location profilePicture isOnline lastSeen');
  }

  private async getUserFriendIds(userId: string): Promise<string[]> {
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    return friendships.map(friendship => 
      friendship.requester.toString() === userId ? 
      friendship.recipient.toString() : 
      friendship.requester.toString()
    );
  }

  async getMapData(userId: string, coordinates: [number, number], radiusInMeters: number = 5000): Promise<{
    friends: any[];
    businesses: any[];
    events: any[];
    users: any[];
  }> {
    const [friends, businesses, events, users] = await Promise.all([
      this.getFriendsNearby(userId, radiusInMeters),
      this.getNearbyBusinesses(coordinates, radiusInMeters),
      this.getNearbyEvents(coordinates, radiusInMeters),
      this.getNearbyUsers(userId, radiusInMeters)
    ]);

    return {
      friends,
      businesses,
      events,
      users
    };
  }
}