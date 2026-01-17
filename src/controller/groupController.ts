import { Request, Response } from 'express';
import { ChatService } from '../services/chatServices';
import { Conversation } from '../models/conversation';
import mongoose from 'mongoose';

const chatService = new ChatService();

export async function createGroup(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const { groupName, participantIds } = req.body;

        if (!groupName || !Array.isArray(participantIds)) {
            return res.status(400).json({ error: 'Group name and participantIds are required' });
        }

        const group = await chatService.createGroup(userId, groupName, participantIds);

        if (!group) {
            return res.status(500).json({ error: 'Failed to create group' });
        }

        return res.status(201).json({
            message: 'Group created successfully',
            group: {
                _id: group._id,
                groupName: group.groupName,
                participants: group.participants,
                groupAdmins: group.groupAdmins,
                createdAt: group.createdAt
            }
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

        const group = await Conversation.findById(groupId);

        if (!group || !group.isGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }


        if (!group.groupAdmins?.some(admin => admin.toString() === adminId)) {
            return res.status(403).json({ error: 'Only admins can add participants' });
        }


        const newParticipants = userIds.map(userId => ({
            participant: new mongoose.Types.ObjectId(userId),
            participantModel: 'User' as const,
            role: 'member' as const,
            joinedAt: new Date()
        }));

        group.participants.push(...newParticipants);
        await group.save();

        return res.status(200).json({
            message: 'Participants added successfully',
            group: await Conversation.findById(groupId).populate('participants.participant', 'name username avatar')
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

        const group = await Conversation.findById(groupId);

        if (!group || !group.isGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const isMember = group.participants.some(p =>
            p.participant.toString() === userId
        );

        if (!isMember) {
            return res.status(403).json({ error: 'Only group members can create polls' });
        }

        const poll = {
            _id: new mongoose.Types.ObjectId(),
            question,
            options: options.map(opt => ({ text: opt, voters: [] })),
            creator: new mongoose.Types.ObjectId(userId),
            isActive: true,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            createdAt: new Date()
        };

        if (!group.groupPolls) {
            group.groupPolls = [];
        }
        group.groupPolls.push(poll);
        await group.save();

        return res.status(201).json({
            message: 'Poll created successfully',
            group: await Conversation.findById(groupId).populate('participants.participant', 'name username avatar')
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

        const group = await Conversation.findById(groupId);

        if (!group || !group.isGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const poll = group.groupPolls?.find((p: any) => p._id.toString() === pollId);
        if (!poll || !poll.isActive) {
            return res.status(404).json({ error: 'Poll not found or inactive' });
        }

        const hasVoted = poll.options.some((option: any) =>
            option.voters.some((voter: any) => voter.toString() === userId)
        );

        if (hasVoted) {
            return res.status(400).json({ error: 'You have already voted in this poll' });
        }

        if (poll.options[optionIndex]) {
            poll.options[optionIndex].voters.push(new mongoose.Types.ObjectId(userId));
            await group.save();
        }

        return res.status(200).json({
            message: 'Vote registered successfully',
            group: await Conversation.findById(groupId).populate('participants.participant', 'name username avatar')
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

        const groups = await Conversation.find({
            isGroup: true,
            'participants.participant': new mongoose.Types.ObjectId(userId)
        })
            .populate('participants.participant', 'name username avatar')
            .populate('lastMessage')
            .populate('groupAdmins', 'name username')
            .sort({ updatedAt: -1 });

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

        const group = await Conversation.findById(groupId);

        if (!group || !group.isGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.groupAdmins?.some(admin => admin.toString() === adminId)) {
            return res.status(403).json({ error: 'Only admins can remove participants' });
        }


        const isCreator = group.participants.some(p =>
            p.participant.toString() === userId && p.role === 'creator'
        );

        if (isCreator) {
            return res.status(403).json({ error: 'Cannot remove group creator' });
        }

        group.participants = group.participants.filter(p =>
            p.participant.toString() !== userId
        );

        await group.save();

        return res.status(200).json({
            message: 'Participant removed successfully',
            group: await Conversation.findById(groupId).populate('participants.participant', 'name username avatar')
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

        const group = await Conversation.findById(groupId);

        if (!group || !group.isGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.groupAdmins?.some(admin => admin.toString() === adminId)) {
            return res.status(403).json({ error: 'Only admins can update group info' });
        }

        if (groupName) group.groupName = groupName;
        if (groupDescription !== undefined) group.groupDescription = groupDescription;
        if (groupImage !== undefined) group.groupImage = groupImage;

        await group.save();

        return res.status(200).json({
            message: 'Group updated successfully',
            group: await Conversation.findById(groupId).populate('participants.participant', 'name username avatar')
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to update group',
            details: (error as Error).message
        });
    }
}