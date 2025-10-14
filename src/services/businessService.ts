import {Bussines,IBussines} from "../models/business";

export class BussinesService {  

    async createBussines(data: Partial<IBussines>): Promise<IBussines> {
        const b = new Bussines(data);
        return await b.save();
    }

    async getAllBussines(skip: number = 0, limit: number = 10): Promise<{bussines: IBussines[], total: number}> {
        const bussines = await Bussines.find({ active: true })
            .skip(skip)
            .limit(limit);
        const total = await Bussines.countDocuments({ active: true });
        return { bussines, total };
    }   
    
    async getAllBussinesWithInactive(skip: number = 0, limit: number = 10): Promise<{bussines: IBussines[], total: number}> {
        const bussines = await Bussines.find()
            .skip(skip)
            .limit(limit);
        const total = await Bussines.countDocuments();
        return { bussines, total };
    }   

    async getBussinesById(id: string): Promise<IBussines | null> {
        console.log("ID en service:", id);
        return await Bussines.findOne({ _id: id, active: true }).populate('eventos');
    }

    async disableBussinesById(id: string): Promise<IBussines | null> {
        return await Bussines.findByIdAndUpdate(
            id, 
            { active: false }, 
            { new: true }
        );
    }   
    async reactivateBussinesById(id: string): Promise<IBussines | null> {
        return await Bussines.findByIdAndUpdate(
            id, 
            { active: true },
            { new: true }
        );
    }
    async deleteBussinesById(id: string): Promise<IBussines | null> {
        return await Bussines.findByIdAndDelete(id);
    }

    async addManagerToBussines(bussinesId: string, managerId: string): Promise<IBussines | null> {
        return await Bussines.findByIdAndUpdate(
            bussinesId,
            { $addToSet: { managers: managerId } },
            { new: true }
        ).populate('managers');
    }   

    async removeManagerFromBussines(bussinesId: string, managerId: string): Promise<IBussines | null> {
        return await Bussines.findByIdAndUpdate(
            bussinesId,
            { $pull: { managers: managerId } },
            { new: true }
        ).populate('managers');
    }   

    //
    /*
    /*FUNCIONES PARA EL PROJECT MANAGER EL EVENTO
    /*
    */
    async addEventoToBussines(bussinesId: string, eventoId: string): Promise<IBussines | null> {
        return await Bussines.findByIdAndUpdate(
            bussinesId,
            { $addToSet: { eventos: eventoId } },
            { new: true }
        ).populate('eventos');
    }
    async removeEventoFromBussines(bussinesId: string, eventoId: string): Promise<IBussines | null> {
        return await Bussines.findByIdAndUpdate(
            bussinesId,
            { $pull: { eventos: eventoId } },
            { new: true }
        ).populate('eventos');
    }
}
