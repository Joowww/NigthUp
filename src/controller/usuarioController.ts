import { Request, Response } from 'express';
import { IUsuario } from '../models/usuario';
import { UserService } from '../services/usuarioServices';
import { validationResult } from 'express-validator';

const userService = new UserService();

export async function createUser(req: Request, res: Response): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, gmail, password, birthday } = req.body as IUsuario;
    const newUser: Partial<IUsuario> = { username, gmail, password, birthday };
    const user = await userService.createUser(newUser);
    return res.status(201).json(user);
  } catch {
    return res.status(500).json({ error: 'FALLO AL CREAR EL USUARIO' });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<Response> {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
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
    if (!user) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function getUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    if (!user) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function updateUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const userData: Partial<IUsuario> = req.body;
    const updatedUser = await userService.updateUserById(id, userData);
    if (!updatedUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function updateUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const userData: Partial<IUsuario> = req.body;
    const updatedUser = await userService.updateUserByUsername(username, userData);
    if (!updatedUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function disableUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const disabledUser = await userService.disableUserById(id);
    if (!disabledUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Usuario deshabilitado correctamente',
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
    if (!disabledUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Usuario deshabilitado correctamente',
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
    if (!reactivatedUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Usuario reactivado correctamente',
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
    if (!reactivatedUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Usuario reactivado correctamente',
      user: reactivatedUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const deletedUser = await userService.deleteUserById(id);
    if (!deletedUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Usuario eliminado permanentemente',
      user: deletedUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteUserByUsername(req: Request, res: Response): Promise<Response> {
  try {
    const { username } = req.params;
    const deletedUser = await userService.deleteUserByUsername(username);
    if (!deletedUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Usuario eliminado permanentemente',
      user: deletedUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function addEventToUser(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: 'Falta eventId' });
    const updated = await userService.addEventToUser(id, eventId);
    if (!updated) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

function removePassword(user: any) {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}

export async function loginUser(req: Request, res: Response): Promise<Response> {
  console.log('login usuario');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { username, password } = req.body;
    
    const user = await userService.loginUser(username, password);
    if (!user) {
      return res.status(401).json({ 
        message: 'CREDENCIALES INCORRECTAS O USUARIO DESHABILITADO' 
      });
    }

    return res.status(200).json({
      message: 'LOGIN EXITOSO',
      user: removePassword(user)
    });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR EN EL LOGIN' });
  }
}

export async function createAdminUser(req: Request, res: Response): Promise<Response> {
  try {
    await userService.createAdminUser();
    return res.status(200).json({ message: 'Usuario admin verificado/creado' });
  } catch (error) {
    return res.status(500).json({ error: 'Error con usuario admin' });
  }
}