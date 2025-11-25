import { Post, IPost } from '../models/post';
import { User } from '../models/user';
import { Friendship } from '../models/friendship';
import { Event } from '../models/event';
import mongoose from 'mongoose';

export interface PostFeedResponse {
  posts: IPost[];
  total: number;
}

export class PostService {
  async createPost(postData: Partial<IPost>): Promise<IPost> {
    const post = new Post(postData);
    return await post.save();
  }

  // FEED DE DISCOVER (Eventos y contenido público popular)
  async getDiscoverFeed(userId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
    try {
      // Posts de eventos + posts públicos populares (excluyendo posts del usuario)
      const posts = await Post.find({
        $or: [
          { event: { $exists: true, $ne: null } }, // Posts de eventos
          { 
            isPublic: true,
            user: { $ne: new mongoose.Types.ObjectId(userId) }, // No posts del usuario actual
            likes: { $size: { $gte: 5 } } // Posts con al menos 5 likes
          }
        ]
      })
      .populate('user', 'username profilePicture bio')
      .populate('event', 'name schedule location category')
      .populate('tags', 'name color')
      .sort({ 
        createdAt: -1,
        'likes': -1 // Ordenar por popularidad
      })
      .skip(skip)
      .limit(limit);

      const total = await Post.countDocuments({
        $or: [
          { event: { $exists: true, $ne: null } },
          { 
            isPublic: true,
            user: { $ne: new mongoose.Types.ObjectId(userId) },
            likes: { $size: { $gte: 5 } }
          }
        ]
      });

      return { posts, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // FEED DE FRIENDS (Amigos y usuarios seguidos)
  async getFriendsFeed(userId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
    try {
      // 1. Obtener lista de amigos
      const friendIds = await this.getUserFriendIds(userId);
      
      // 2. Incluir también los posts del usuario actual
      const allUserIds = [...friendIds, new mongoose.Types.ObjectId(userId)];

      // 3. Buscar posts de amigos (excluyendo posts de eventos)
      const posts = await Post.find({
        user: { $in: allUserIds },
        event: { $exists: false } // Excluir posts de eventos
      })
      .populate('user', 'username profilePicture bio isOnline lastSeen')
      .populate('tags', 'name color')
      .sort({ 
        createdAt: -1,
        isOnline: -1 // Priorizar amigos online
      })
      .skip(skip)
      .limit(limit);

      const total = await Post.countDocuments({
        user: { $in: allUserIds },
        event: { $exists: false }
      });

      return { posts, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Obtener IDs de amigos del usuario
  private async getUserFriendIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
    try {
      const friendships = await Friendship.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      });

      return friendships.map(friendship => 
        friendship.requester.toString() === userId 
          ? new mongoose.Types.ObjectId(friendship.recipient.toString())
          : new mongoose.Types.ObjectId(friendship.requester.toString())
      );
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Crear post de evento (para negocios/eventos)
  async createEventPost(eventId: string, postData: Partial<IPost>): Promise<IPost> {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const post = new Post({
        ...postData,
        event: eventId,
        isPublic: true // Los posts de eventos son siempre públicos
      });

      return await post.save();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Obtener posts de un evento específico
  async getEventPosts(eventId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
    try {
      const posts = await Post.find({ event: eventId })
        .populate('user', 'username profilePicture')
        .populate('event', 'name schedule location')
        .populate('tags', 'name color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({ event: eventId });
      return { posts, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Obtener posts de un usuario específico
  async getUserPosts(userId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
    try {
      const posts = await Post.find({ 
        user: userId,
        event: { $exists: false } // Excluir posts de eventos
      })
        .populate('user', 'username profilePicture bio')
        .populate('tags', 'name color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({ 
        user: userId,
        event: { $exists: false }
      });
      return { posts, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Obtener un post por ID
  async getPostById(postId: string): Promise<IPost | null> {
    try {
      return await Post.findById(postId)
        .populate('user', 'username profilePicture bio isOnline lastSeen')
        .populate('event', 'name schedule location category')
        .populate('tags', 'name color')
        .populate('likes', 'username profilePicture')
        .populate('comments.user', 'username profilePicture');
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Like a un post
  async likePost(postId: string, userId: string): Promise<IPost | null> {
    try {
      return await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Unlike a un post
  async unlikePost(postId: string, userId: string): Promise<IPost | null> {
    try {
      return await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      );
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Añadir comentario a un post
  async addComment(postId: string, userId: string, text: string): Promise<IPost | null> {
    try {
      const comment = {
        user: userId,
        text: text
      };

      return await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: comment } },
        { new: true }
      ).populate('comments.user', 'username profilePicture');
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Eliminar comentario de un post
  async deleteComment(postId: string, commentIndex: number): Promise<IPost | null> {
    try {
      return await Post.findByIdAndUpdate(
        postId,
        { $unset: { [`comments.${commentIndex}`]: 1 } },
        { new: true }
      ).then(post => {
        if (post) {
          post.comments = post.comments.filter((_, index) => index !== commentIndex);
          return post.save();
        }
        return null;
      });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Incrementar vistas de un post
  async incrementViews(postId: string): Promise<IPost | null> {
    try {
      return await Post.findByIdAndUpdate(
        postId,
        { $inc: { views: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Eliminar un post
  async deletePost(postId: string, userId: string): Promise<IPost | null> {
    try {
      // Verificar que el usuario es el dueño del post
      const post = await Post.findOne({ _id: postId, user: userId });
      if (!post) {
        throw new Error('Post not found or you are not the owner');
      }

      return await Post.findByIdAndDelete(postId);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Buscar posts por término
  async searchPosts(searchTerm: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
    try {
      const posts = await Post.find({
        $or: [
          { caption: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } }
        ],
        isPublic: true
      })
        .populate('user', 'username profilePicture')
        .populate('event', 'name schedule location')
        .populate('tags', 'name color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        $or: [
          { caption: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } }
        ],
        isPublic: true
      });

      return { posts, total };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}