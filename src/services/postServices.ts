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

    async getDiscoverFeed(userId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
        try {
            const posts = await Post.find({
                $or: [
                    { event: { $exists: true, $ne: null } },
                    {
                        isPublic: true,
                        user: { $ne: new mongoose.Types.ObjectId(userId) },
                        likes: { $size: { $gte: 5 } }
                    }
                ]
            })
            .populate('user', 'username avatar coverPhoto bio')
            .populate('event', 'name schedule location category image')
            .populate('tags', 'name color')
            .sort({
                createdAt: -1,
                'likes': -1
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

    async getFriendsFeed(userId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
        try {
            const friendIds = await this.getUserFriendIds(userId);
            const allUserIds = [...friendIds, new mongoose.Types.ObjectId(userId)];

            const posts = await Post.find({
                user: { $in: allUserIds },
                event: { $exists: false }
            })
            .populate('user', 'username avatar coverPhoto bio isOnline lastSeen')
            .populate('tags', 'name color')
            .sort({
                createdAt: -1,
                isOnline: -1
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

    async getForYouFeed(userId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
        try {
            const user = await User.findById(userId).select('interests friends');
            const userInterests = user?.interests || [];
            const userFriends = user?.friends || [];

            const posts = await Post.find({
                $or: [
                    { user: { $in: userFriends } },
                    { tags: { $in: userInterests } },
                    { event: { $exists: true, $ne: null }, 'likes': { $size: { $gte: 10 } } }
                ]
            })
            .populate('user', 'username avatar coverPhoto bio')
            .populate('event', 'name schedule location category image')
            .populate('tags', 'name color')
            .sort({
                createdAt: -1,
                likes: -1
            })
            .skip(skip)
            .limit(limit);

            const total = await Post.countDocuments({
                $or: [
                    { user: { $in: userFriends } },
                    { tags: { $in: userInterests } },
                    { event: { $exists: true, $ne: null }, 'likes': { $size: { $gte: 10 } } }
                ]
            });

            return { posts, total };
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

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

    async createEventPost(eventId: string, postData: Partial<IPost>): Promise<IPost> {
        try {
            const event = await Event.findById(eventId);
            if (!event) {
                throw new Error('Event not found');
            }

            const post = new Post({
                ...postData,
                event: eventId,
                isPublic: true
            });

            return await post.save();
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    async getEventPosts(eventId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
        try {
            const posts = await Post.find({ event: eventId })
            .populate('user', 'username avatar')
            .populate('event', 'name schedule location image')
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

    async getUserPosts(userId: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
        try {
            const posts = await Post.find({
                user: userId,
                event: { $exists: false }
            })
            .populate('user', 'username avatar coverPhoto bio')
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

    async getPostById(postId: string): Promise<IPost | null> {
        try {
            return await Post.findById(postId)
            .populate('user', 'username avatar coverPhoto bio isOnline lastSeen')
            .populate('event', 'name schedule location category image')
            .populate('tags', 'name color')
            .populate('likes', 'username avatar')
            .populate('comments.user', 'username avatar');
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

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
            ).populate('comments.user', 'username avatar');
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

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

    async deletePost(postId: string, userId: string): Promise<IPost | null> {
        try {
            const post = await Post.findOne({ _id: postId, user: userId });
            if (!post) {
                throw new Error('Post not found or you are not the owner');
            }

            return await Post.findByIdAndDelete(postId);
        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    async searchPosts(searchTerm: string, skip: number = 0, limit: number = 10): Promise<PostFeedResponse> {
        try {
            const posts = await Post.find({
                $or: [
                    { caption: { $regex: searchTerm, $options: 'i' } },
                    { location: { $regex: searchTerm, $options: 'i' } }
                ],
                isPublic: true
            })
            .populate('user', 'username avatar')
            .populate('event', 'name schedule location image')
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