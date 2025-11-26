import { Request, Response } from 'express';
import { PostService } from '../services/postServices';
import { upload } from '../middleware/upload';

const postService = new PostService();

export async function getDiscoverFeed(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await postService.getDiscoverFeed(userId, skip, limit);

        return res.status(200).json({
            feedType: 'discover',
            posts: result.posts,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error retrieving discover feed',
            details: (error as Error).message
        });
    }
}

export async function getFriendsFeed(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await postService.getFriendsFeed(userId, skip, limit);

        return res.status(200).json({
            feedType: 'friends',
            posts: result.posts,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error retrieving friends feed',
            details: (error as Error).message
        });
    }
}

export async function getForYouFeed(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await postService.getForYouFeed(userId, skip, limit);

        return res.status(200).json({
            feedType: 'for-you',
            posts: result.posts,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error retrieving for you feed',
            details: (error as Error).message
        });
    }
}

export async function createUserPost(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const { caption, location, tags, isPublic } = req.body;

        const files = req.files as Express.Multer.File[];
        const media = files?.map(file => ({ 
            url: '/uploads/posts/${file.filename}',
            type: file.mimetype.startsWith('video/') ? 'video' as const : 'image' as const
        })) || [];

        const postData = {
            user: userId,
            caption,
            media,
            location,
            tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
            isPublic: isPublic === 'true' || isPublic === true
        };

        const post = await postService.createPost(postData);
        return res.status(201).json(post);
    } catch (error) {
        console.error('Error creating user post:', error);
        return res.status(500).json({ error: 'Failed to create post' });
    }
}

export async function createEventPost(req: Request, res: Response): Promise<Response> {
    try {
        const { eventId, caption, location, tags, isPublic } = req.body;

        const files = req.files as Express.Multer.File[];
        const media = files?.map(file => ({ 
            url: '/uploads/posts/${file.filename}',
            type: file.mimetype.startsWith('video/') ? 'video' as const : 'image' as const
        })) || [];

        const postData = {
            event: eventId,
            caption,
            media,
            location,
            tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
            isPublic: isPublic === 'true' || isPublic === true
        };

        const post = await postService.createEventPost(eventId, postData);
        return res.status(201).json(post);
    } catch (error) {
        console.error('Error creating event post:', error);
        return res.status(500).json({ error: 'Failed to create event post' });
    }
}

export async function getEventPosts(req: Request, res: Response): Promise<Response> {
    try {
        const { eventId } = req.params;
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await postService.getEventPosts(eventId, skip, limit);

        return res.status(200).json({
            posts: result.posts,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error retrieving event posts',
            details: (error as Error).message
        });
    }
}

export async function getUserPosts(req: Request, res: Response): Promise<Response> {
    try {
        const { userId } = req.params;
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await postService.getUserPosts(userId, skip, limit);

        return res.status(200).json({
            posts: result.posts,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error retrieving user posts',
            details: (error as Error).message
        });
    }
}

export async function getPostById(req: Request, res: Response): Promise<Response> {
    try {
        const { postId } = req.params;
        const post = await postService.getPostById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({
            error: 'Error retrieving post',
            details: (error as Error).message
        });
    }
}

export async function likePost(req: Request, res: Response): Promise<Response> {
    try {
        const { postId } = req.params;
        const userId = (req as any).user.id;

        const post = await postService.likePost(postId, userId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({
            error: 'Error liking post',
            details: (error as Error).message
        });
    }
}

export async function unlikePost(req: Request, res: Response): Promise<Response> {
    try {
        const { postId } = req.params;
        const userId = (req as any).user.id;

        const post = await postService.unlikePost(postId, userId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({
            error: 'Error unliking post',
            details: (error as Error).message
        });
    }
}

export async function addComment(req: Request, res: Response): Promise<Response> {
    try {
        const { postId } = req.params;
        const userId = (req as any).user.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const post = await postService.addComment(postId, userId, text);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({
            error: 'Error adding comment',
            details: (error as Error).message
        });
    }
}

export async function deleteComment(req: Request, res: Response): Promise<Response> {
    try {
        const { postId, commentIndex } = req.params;

        const post = await postService.deleteComment(postId, parseInt(commentIndex));

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({
            error: 'Error deleting comment',
            details: (error as Error).message
        });
    }
}

export async function deletePost(req: Request, res: Response): Promise<Response> {
    try {
        const { postId } = req.params;
        const userId = (req as any).user.id;

        const post = await postService.deletePost(postId, userId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found or you are not the owner' });
        }

        return res.status(200).json({ message: 'Post deleted successfully', post });
    } catch (error) {
        return res.status(500).json({
            error: 'Error deleting post',
            details: (error as Error).message
        });
    }
}

export async function searchPosts(req: Request, res: Response): Promise<Response> {
    try {
        const { q } = req.query;
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const result = await postService.searchPosts(q as string, skip, limit);

        return res.status(200).json({
            posts: result.posts,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error searching posts',
            details: (error as Error).message
        });
    }
}