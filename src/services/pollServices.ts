import { Poll, IPoll } from '../models/poll';

export class PollService {
  async createPoll(creatorId: string, question: string, options: string[], isPublic: boolean = true, allowedVoters?: string[], expiresAt?: Date): Promise<IPoll> {
    const pollOptions = options.map(opt => ({ text: opt, voters: [] }));
    const poll = new Poll({
      creator: creatorId,
      question,
      options: pollOptions,
      isPublic,
      allowedVoters,
      expiresAt
    });
    return await poll.save();
  }

  async getActivePolls(userId: string): Promise<IPoll[]> {
    const now = new Date();
    return await Poll.find({
      isActive: true,
      $and: [
        {
          $or: [
            { isPublic: true },
            { allowedVoters: userId },
            { creator: userId }
          ]
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: now } }
          ]
        }
      ]
    })
    .populate('creator', 'username email')
    .populate('options.voters', 'username email')
    .populate('allowedVoters', 'username email')
    .sort({ createdAt: -1 });
  }

  async voteInPoll(pollId: string, optionIndex: number, userId: string): Promise<IPoll | null> {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    // Verificar si la encuesta está activa
    if (!poll.isActive) {
      throw new Error('Poll is not active');
    }

    // Verificar si ha expirado
    if (poll.expiresAt && poll.expiresAt < new Date()) {
      throw new Error('Poll has expired');
    }

    // Verificar si el usuario puede votar
    if (!poll.isPublic && !poll.allowedVoters?.includes(userId as any) && poll.creator.toString() !== userId) {
      throw new Error('You are not allowed to vote in this poll');
    }

    // Verificar si el usuario ya votó
    const hasVoted = poll.options.some(option => option.voters.includes(userId as any));
    if (hasVoted) {
      throw new Error('You have already voted in this poll');
    }

    // Agregar voto
    poll.options[optionIndex].voters.push(userId as any);
    return await poll.save();
  }

  async closePoll(pollId: string, creatorId: string): Promise<IPoll | null> {
    const poll = await Poll.findOne({ _id: pollId, creator: creatorId });
    if (!poll) {
      throw new Error('Poll not found or you are not the creator');
    }

    poll.isActive = false;
    return await poll.save();
  }

  async getPollResults(pollId: string): Promise<any> {
    const poll = await Poll.findById(pollId)
      .populate('creator', 'username email')
      .populate('options.voters', 'username email');

    if (!poll) {
      throw new Error('Poll not found');
    }

    const totalVotes = poll.options.reduce((sum, option) => sum + option.voters.length, 0);
    const results = poll.options.map(option => ({
      text: option.text,
      votes: option.voters.length,
      percentage: totalVotes > 0 ? (option.voters.length / totalVotes) * 100 : 0,
      voters: option.voters
    }));

    return {
      question: poll.question,
      totalVotes,
      results,
      isActive: poll.isActive
    };
  }
}