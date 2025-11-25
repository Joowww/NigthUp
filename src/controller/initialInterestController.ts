// controller/initialInterestController.ts - CORREGIDO
import { Request, Response } from 'express';
import { UserInterestService } from '../services/userInterestServices';
import { TagService } from '../services/tagServices';
import mongoose from 'mongoose';

const userInterestService = new UserInterestService();
const tagService = new TagService();

export async function createInitialInterests(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;
    const { musicType, musician, eventType, childhoodIdol } = req.body;

    console.log('🎯 Creating initial interests for user:', userId);
    console.log('📝 Selections:', { musicType, musician, eventType, childhoodIdol });

    // Validar que todos los campos estén presentes
    if (!musicType || !musician || !eventType || !childhoodIdol) {
      return res.status(400).json({ 
        error: 'All selections are required',
        required: ['musicType', 'musician', 'eventType', 'childhoodIdol']
      });
    }

    // Buscar todos los tags para mapear nombres a IDs
    const allTags = await tagService.getAllTags(0, 1000);
    const tagMap = new Map();
    
    allTags.tags.forEach(tag => {
      tagMap.set(tag.name, tag._id.toString());
    });

    console.log('🔍 Tag mapping:', Array.from(tagMap.entries()));

    // Verificar que todos los tags seleccionados existan
    const selections = [
      { name: musicType, type: 'MusicType' },
      { name: musician, type: 'Musician' },
      { name: eventType, type: 'EventType' },
      { name: childhoodIdol, type: 'ChildhoodIdol' }
    ];

    const missingTags = selections.filter(selection => !tagMap.has(selection.name));
    if (missingTags.length > 0) {
      return res.status(400).json({
        error: 'Some selected tags do not exist',
        missingTags
      });
    }

    // Crear intereses con score alto (5.0)
    const interests = selections.map(selection => ({
      userId: new mongoose.Types.ObjectId(userId),
      tagId: new mongoose.Types.ObjectId(tagMap.get(selection.name)),
      score: 5.0
    }));

    console.log('💾 Saving interests:', interests);

    // Guardar intereses usando el servicio existente
    for (const interest of interests) {
      await userInterestService.createUserInterest({
        userId: interest.userId,
        tagId: interest.tagId,
        score: interest.score
      });
    }

    return res.status(201).json({ 
      message: 'Initial interests saved successfully',
      interestsCount: interests.length,
      selections: {
        musicType,
        musician, 
        eventType,
        childhoodIdol
      }
    });

  } catch (error) {
    console.error('❌ Error creating initial interests:', error);
    return res.status(500).json({ 
      error: 'Failed to save initial interests',
      details: (error as Error).message 
    });
  }
}