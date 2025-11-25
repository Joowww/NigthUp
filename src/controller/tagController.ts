import { Request, Response } from 'express';
import { ITag } from '../models/tag';
import { TagService } from '../services/tagServices';
import { validationResult } from 'express-validator';

const tagService = new TagService();

export async function createTag(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, color } = req.body as ITag;
        const newTag: Partial<ITag> = { name, description, color };
        const tag = await tagService.createTag(newTag);
        return res.status(201).json(tag);
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to create tag', 
            details: (error as Error).message 
        });
    }
}

export async function getAllTags(req: Request, res: Response): Promise<Response> {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;

        const result = await tagService.getAllTags(skip, limit, search);
        return res.status(200).json({
            tags: result.tags,
            pagination: {
                skip,
                limit,
                total: result.total,
                hasMore: (skip + limit) < result.total
            }
        });
    } catch (error) {
        return res.status(404).json({ message: (error as Error).message });
    }
}

export async function getTagById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const tag = await tagService.getTagById(id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        return res.status(200).json(tag);
    } catch (error) {
        return res.status(404).json({ message: (error as Error).message });
    }
}

export async function getTagsByEvent(req: Request, res: Response): Promise<Response> {
    try {
        const { eventId } = req.params;
        const tags = await tagService.getTagsByEvent(eventId);
        return res.status(200).json(tags);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function updateTag(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { name, description, color } = req.body as ITag;
        const updatedTag: Partial<ITag> = { name, description, color };
        const tag = await tagService.updateTag(id, updatedTag);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        return res.status(200).json(tag);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function deleteTag(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const tag = await tagService.deleteTag(id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        return res.status(200).json({
            message: 'Tag deleted successfully',
            deletedTag: tag
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function getTagStats(req: Request, res: Response): Promise<Response> {
    try {
        const stats = await tagService.getTagStats();
        return res.status(200).json(stats);
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export async function getTagsByType(req: Request, res: Response): Promise<Response> {
  try {
    const { type } = req.params;

    // Validar que el tipo sea uno de los permitidos
    const validTypes = ['MusicType', 'Musician', 'EventType', 'ChildhoodIdol'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid tag type', 
        validTypes 
      });
    }

    const tags = await tagService.getTagsByType(type);

    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error retrieving tags by type',
      details: (error as Error).message 
    });
  }
}