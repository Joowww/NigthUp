import { Request, Response } from 'express';
import { GroupService } from '../services/groupServices';

const groupService = new GroupService();

export async function createGroup(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const { groupName, participantIds, description, groupImage } = req.body;

        if (!groupName || !Array.isArray(participantIds)) {
            return res.status(400).json({ error: 'Group name and participantIds are required' });
        }

        const group = await groupService.createGroup(userId, groupName, participantIds, description, groupImage);
        
        return res.status(201).json({
            message: 'Group created successfully',
            group
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to create group', 
            details: (error as Error).message 
        });
    }
}

export async function addGroupParticipants(req: Request, res: Response): Promise<Response> {
    try {
        const adminId = (req as any).user.id;
        const { groupId } = req.params;
        const { userIds } = req.body;

        if (!Array.isArray(userIds)) {
            return res.status(400).json({ error: 'userIds must be an array' });
        }

        const group = await groupService.addParticipants(groupId, userIds, adminId);
        
        return res.status(200).json({
            message: 'Participants added successfully',
            group
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to add participants', 
            details: (error as Error).message 
        });
    }
}

export async function createGroupPoll(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const { groupId } = req.params;
        const { question, options, expiresAt } = req.body;

        if (!question || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ error: 'Question and at least 2 options are required' });
        }

        const group = await groupService.createPoll(groupId, userId, question, options, expiresAt ? new Date(expiresAt) : undefined);
        
        return res.status(201).json({
            message: 'Poll created successfully',
            group
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to create poll', 
            details: (error as Error).message 
        });
    }
}

export async function voteInGroupPoll(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const { groupId, pollId } = req.params;
        const { optionIndex } = req.body;

        if (typeof optionIndex !== 'number') {
            return res.status(400).json({ error: 'optionIndex must be a number' });
        }

        const group = await groupService.voteInPoll(groupId, pollId, userId, optionIndex);
        
        return res.status(200).json({
            message: 'Vote registered successfully',
            group
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to vote in poll', 
            details: (error as Error).message 
        });
    }
}

export async function getUserGroups(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const groups = await groupService.getUserGroups(userId);
        
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to get user groups', 
            details: (error as Error).message 
        });
    }
}

export async function removeGroupParticipant(req: Request, res: Response): Promise<Response> {
    try {
        const adminId = (req as any).user.id;
        const { groupId, userId } = req.params;

        const group = await groupService.removeParticipant(groupId, userId, adminId);
        
        return res.status(200).json({
            message: 'Participant removed successfully',
            group
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to remove participant', 
            details: (error as Error).message 
        });
    }
}

export async function updateGroupInfo(req: Request, res: Response): Promise<Response> {
    try {
        const adminId = (req as any).user.id;
        const { groupId } = req.params;
        const { groupName, groupDescription, groupImage } = req.body;

        const group = await groupService.updateGroupInfo(groupId, adminId, {
            groupName,
            groupDescription,
            groupImage
        });
        
        return res.status(200).json({
            message: 'Group updated successfully',
            group
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to update group', 
            details: (error as Error).message 
        });
    }
}