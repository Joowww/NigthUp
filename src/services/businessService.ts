import { Business, IBusiness } from "../models/business";

export class BusinessService {
  async createBusiness(data: Partial<IBusiness>): Promise<IBusiness> {
    const business = new Business(data);
    return await business.save();
  }

  async getAllBusinesses(skip: number = 0, limit: number = 10): Promise<{businesses: IBusiness[], total: number}> {
    const businesses = await Business.find({ active: true })
      .skip(skip)
      .limit(limit)
      .populate('events')
      .populate('managers', 'username email');
    
    const total = await Business.countDocuments({ active: true });
    return { businesses, total };
  }

  async getAllBusinessesWithInactive(skip: number = 0, limit: number = 10): Promise<{businesses: IBusiness[], total: number}> {
    const businesses = await Business.find()
      .skip(skip)
      .limit(limit)
      .populate('events')
      .populate('managers', 'username email');
    
    const total = await Business.countDocuments();
    return { businesses, total };
  }

  async getBusinessById(id: string): Promise<IBusiness | null> {
    return await Business.findOne({ _id: id, active: true })
      .populate('events')
      .populate('managers', 'username email');
  }

  async disableBusinessById(id: string): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    ).populate('events').populate('managers', 'username email');
  }

  async reactivateBusinessById(id: string): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    ).populate('events').populate('managers', 'username email');
  }

  async deleteBusinessById(id: string): Promise<IBusiness | null> {
    return await Business.findByIdAndDelete(id);
  }

  async addManagerToBusiness(businessId: string, managerId: string): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      { $addToSet: { managers: managerId } },
      { new: true }
    ).populate('managers', 'username email').populate('events');
  }

  async removeManagerFromBusiness(businessId: string, managerId: string): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      { $pull: { managers: managerId } },
      { new: true }
    ).populate('managers', 'username email').populate('events');
  }

  async addEventToBusiness(businessId: string, eventId: string): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      { $addToSet: { events: eventId } },
      { new: true }
    ).populate('events').populate('managers', 'username email');
  }

  async removeEventFromBusiness(businessId: string, eventId: string): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      { $pull: { events: eventId } },
      { new: true }
    ).populate('events').populate('managers', 'username email');
  }

  async updateBusiness(id: string, data: Partial<IBusiness>): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      id, 
      data, 
      { new: true }
    ).populate('events').populate('managers', 'username email');
  }
}