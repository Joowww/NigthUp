import { Conversation, IConversation, IGroupPoll } from '../models/conversation';
import { User } from '../models/user';
import mongoose, { Types } from 'mongoose';

export class GroupService {
    
    async createGroup(creatorId: string, groupName: string, participantIds: string[], description?: string, groupImage?: string): Promise<IConversation> {
        const participants = [
            {
                participant: new Types.ObjectId(creatorId),
                participantModel: 'User' as const,
                role: 'creator' as const
            },
            ...participantIds.map(id => ({
                participant: new Types.ObjectId(id),
                participantModel: 'User' as const,
                role: 'member' as const
            }))
        ];

        const group = new Conversation({
            participants,
            isGroup: true,
            groupName,
            groupDescription: description,
            groupImage,
            groupAdmins: [new Types.ObjectId(creatorId)]
        });

        return await group.save();
    }

    async addParticipants(groupId: string, userIds: string[], adminId: string): Promise<IConversation | null> {
        const group = await Conversation.findById(groupId);
        
        if (!group || !group.isGroup) {
            throw new Error('Group not found');
        }

        if (!group.groupAdmins.includes(new Types.ObjectId(adminId))) {
            throw new Error('Only admins can add participants');
        }

        const newParticipants = userIds.map(userId => ({
            participant: new Types.ObjectId(userId),
            participantModel: 'User' as const,
            role: 'member' as const,
            joinedAt: new Date()
        }));

        group.participants.push(...newParticipants);
        return await group.save();
    }

    async createPoll(groupId: string, creatorId: string, question: string, options: string[], expiresAt?: Date): Promise<IConversation | null> {
        const group = await Conversation.findById(groupId);
        
        if (!group || !group.isGroup) {
            throw new Error('Group not found');
        }

        const isMember = group.participants.some(p => 
            p.participant.toString() === creatorId
        );

        if (!isMember) {
            throw new Error('Only group members can create polls');
        }

        const poll: IGroupPoll = {
            _id: new Types.ObjectId(),
            question,
            options: options.map(opt => ({ text: opt, voters: [] })),
            creator: new Types.ObjectId(creatorId),
            isActive: true,
            expiresAt,
            createdAt: new Date()
        };

        group.groupPolls.push(poll);
        return await group.save();
    }

    async voteInPoll(groupId: string, pollId: string, userId: string, optionIndex: number): Promise<IConversation | null> {
        const group = await Conversation.findById(groupId);
        
        if (!group || !group.isGroup) {
            throw new Error('Group not found');
        }

        const poll = group.groupPolls.find((p: IGroupPoll) => p._id.toString() === pollId);
        if (!poll || !poll.isActive) {
            throw new Error('Poll not found or inactive');
        }

        const hasVoted: boolean = poll.options.some((option: { voters: Types.ObjectId[] }) => 
            option.voters.some((voter: Types.ObjectId) => voter.toString() === userId)
        );

        if (hasVoted) {
            throw new Error('You have already voted in this poll');
        }

        if (poll.options[optionIndex]) {
            poll.options[optionIndex].voters.push(new Types.ObjectId(userId));
        }

        return await group.save();
    }

    async getUserGroups(userId: string): Promise<IConversation[]> {
        return await Conversation.find({
            'isGroup': true,
            'participants.participant': new Types.ObjectId(userId)
        })
        .populate('participants.participant', 'username avatar')
        .populate('lastMessage')
        .populate('groupAdmins', 'username avatar')
        .sort({ updatedAt: -1 });
    }

    async removeParticipant(groupId: string, userId: string, adminId: string): Promise<IConversation | null> {
        const group = await Conversation.findById(groupId);
        
        if (!group || !group.isGroup) {
            throw new Error('Group not found');
        }

        if (!group.groupAdmins.includes(new Types.ObjectId(adminId))) {
            throw new Error('Only admins can remove participants');
        }

        group.participants = group.participants.filter(p => 
            p.participant.toString() !== userId
        );

        return await group.save();
    }

    async updateGroupInfo(groupId: string, adminId: string, updates: { groupName?: string; groupDescription?: string; groupImage?: string }): Promise<IConversation | null> {
        const group = await Conversation.findById(groupId);
        
        if (!group || !group.isGroup) {
            throw new Error('Group not found');
        }

        if (!group.groupAdmins.includes(new Types.ObjectId(adminId))) {
            throw new Error('Only admins can update group info');
        }

        if (updates.groupName) group.groupName = updates.groupName;
        if (updates.groupDescription) group.groupDescription = updates.groupDescription;
        if (updates.groupImage) group.groupImage = updates.groupImage;

        return await group.save();
    }
}