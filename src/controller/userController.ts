import { Request, Response } from 'express';
import { IUser } from '../models/user';
import { UserService } from '../services/userServices';
import { validationResult } from 'express-validator';

const userService = new UserService();

function removePassword(user: any) {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  return userObj;
}

export async function createUser(req: Request, res: Response): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, email, password, birthday, role } = req.body;
    
    if (role === 'admin') {
      return res.status(403).json({ error: 'Cannot create admin user from this route' });
    }

    const newUser: Partial<IUser> = { 
      username, 
      email, 
      password, 
      birthday,
      role: role || 'user'
    };
    
    const user = await userService.createUser(newUser);
    if (!user) {
      return res.status(500).json({ error: 'FAILED TO CREATE USER' });
    }
    
    return res.status(201).json(removePassword(user));
  } catch (error) {
    return res.status(500).json({ error: 'FAILED TO CREATE USER', details: (error as Error).message });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<Response> {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const result = await userService.getAllUsers(skip, limit);
    return res.status(200).json({
      users: result.users,
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

export async function getAllUsersWithInactive(req: Request, res: Response): Promise<Response> {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await userService.getAllUsersWithInactive(skip, limit);
    return res.status(200).json({
      users: result.users,
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

export async function getUserByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const user = await userService.getUserByIdentifier(identifier);
    if (!user) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function updateUserByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const userData: Partial<IUser> = req.body;

    // No permitir actualizar password desde aquí
    if (userData.password) {
      return res.status(400).json({ message: 'Password cannot be updated from this endpoint' });
    }

    // ✅ MODIFICADO: Permitir actualizar role si el usuario que hace la petición es admin
    const userRole = req.headers['user-role'] as string;
    if (userData.role && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update user roles' });
    }

    // Verificar que al menos un campo fue proporcionado
    if (Object.keys(userData).length === 0) {
      return res.status(400).json({ 
        message: 'No fields to update provided' 
      });
    }

    const updatedUser = await userService.updateUserByIdentifier(identifier, userData);
    if (!updatedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    
    return res.status(200).json({ 
      message: 'User updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function disableUserByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const disabledUser = await userService.disableUserByIdentifier(identifier);
    if (!disabledUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User disabled successfully',
      user: disabledUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function reactivateUserByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const reactivatedUser = await userService.reactivateUserByIdentifier(identifier);
    if (!reactivatedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User reactivated successfully',
      user: reactivatedUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function makeUserAdminByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const adminUser = await userService.makeUserAdminByIdentifier(identifier);
    if (!adminUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User converted to administrator',
      user: adminUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function removeUserAdminByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const normalUser = await userService.removeUserAdminByIdentifier(identifier);
    if (!normalUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'Administrator permissions removed',
      user: normalUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

// ✅ NUEVO: Endpoint específico para hacer manager
export async function makeUserManagerByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const managerUser = await userService.makeUserManagerByIdentifier(identifier);
    if (!managerUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User converted to manager',
      user: managerUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

// ✅ NUEVO: Endpoint específico para quitar manager
export async function removeUserManagerByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const normalUser = await userService.removeUserManagerByIdentifier(identifier);
    if (!normalUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'Manager permissions removed',
      user: normalUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteUserByIdentifier(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const deletedUser = await userService.deleteUserByIdentifier(identifier);
    if (!deletedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User permanently deleted',
      user: removePassword(deletedUser)
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function addEventToUser(req: Request, res: Response): Promise<Response> {
  try {
    const { identifier } = req.params;
    const { eventIdentifier } = req.body;
    if (!eventIdentifier) return res.status(400).json({ message: 'Missing eventIdentifier' });
    const updated = await userService.addEventToUser(identifier, eventIdentifier);
    if (!updated) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, password } = req.body;
    const user = await userService.loginUser(username, password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials or user inactive' });

    const safeUser = removePassword(user);
    return res.status(200).json({ user: safeUser });
  } catch (err) {
    return res.status(500).json({ message: 'Login error' });
  }
};

export async function getUserStats(req: Request, res: Response): Promise<Response> {
  try {
    const stats = await userService.getUserStats();
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
}