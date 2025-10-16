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
    
    // Validar que no se pueda crear usuario con rol admin desde esta ruta
    if (role === 'admin') {
      return res.status(403).json({ error: 'No se puede crear usuario admin desde esta ruta' });
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

export async function createAdminUser(req: Request, res: Response): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, birthday } = req.body;

    const newAdmin: Partial<IUser> = { 
      username, 
      email, 
      password, 
      birthday,
      role: 'admin' 
    };
    
    const adminUser = await userService.createUser(newAdmin);
    if (!adminUser) {
      return res.status(500).json({ error: 'FAILED TO CREATE ADMIN USER' });
    }

    return res.status(201).json({
      message: 'Admin user created successfully',
      user: removePassword(adminUser)
    });
  } catch (error) {
    return res.status(500).json({ error: 'FAILED TO CREATE ADMIN USER', details: (error as Error).message });
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

export async function getUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function getUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    if (!user) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function updateUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const userData: Partial<IUser> = req.body;
    
    // No permitir actualizar password desde aquí
    if (userData.password) {
      return res.status(400).json({ message: 'Password cannot be updated from this endpoint' });
    }

    const updatedUser = await userService.updateUserById(id, userData);
    if (!updatedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function updateUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const userData: Partial<IUser> = req.body;
    
    // No permitir actualizar password desde aquí
    if (userData.password) {
      return res.status(400).json({ message: 'Password cannot be updated from this endpoint' });
    }

    const updatedUser = await userService.updateUserByUsername(username, userData);
    if (!updatedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function disableUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const disabledUser = await userService.disableUserById(id);
    if (!disabledUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User disabled successfully',
      user: disabledUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function disableUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const disabledUser = await userService.disableUserByUsername(username);
    if (!disabledUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User disabled successfully',
      user: disabledUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function reactivateUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const reactivatedUser = await userService.reactivateUserById(id);
    if (!reactivatedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User reactivated successfully',
      user: reactivatedUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function reactivateUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const reactivatedUser = await userService.reactivateUserByUsername(username);
    if (!reactivatedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User reactivated successfully',
      user: reactivatedUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function makeUserAdmin(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const adminUser = await userService.makeUserAdmin(id);
    if (!adminUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User converted to administrator',
      user: adminUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function removeUserAdmin(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const normalUser = await userService.removeUserAdmin(id);
    if (!normalUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'Administrator permissions removed',
      user: normalUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const deletedUser = await userService.deleteUserById(id);
    if (!deletedUser) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json({ 
      message: 'User permanently deleted',
      user: removePassword(deletedUser)
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const deletedUser = await userService.deleteUserByUsername(username);
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
    const { id } = req.params;
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: 'Missing eventId' });
    const updated = await userService.addEventToUser(id, eventId);
    if (!updated) return res.status(404).json({ message: 'USER NOT FOUND' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function loginUser(req: Request, res: Response): Promise<Response> {
  console.log('user login');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { username, password } = req.body;
    
    const user = await userService.loginUser(username, password);
    if (!user) {
      return res.status(401).json({ 
        message: 'INCORRECT CREDENTIALS OR USER DISABLED' 
      });
    }

    return res.status(200).json({
      message: 'LOGIN SUCCESSFUL',
      user: removePassword(user)
    });
  } catch (error) {
    return res.status(500).json({ error: 'LOGIN ERROR', details: (error as Error).message });
  }
}