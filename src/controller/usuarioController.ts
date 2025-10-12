import { Request, Response } from 'express';
import { IUsuario } from '../models/usuario';
import { UserService } from '../services/usuarioServices';
import { validationResult } from 'express-validator';

const userService = new UserService();

async function verifyAdmin(username: string, password: string): Promise<boolean> {
  try {
    const user = await userService.loginAdmin(username, password);
    return user !== null;
  } catch {
    return false;
  }
}

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

// NUEVO: Crear usuario admin (requiere que ya exista un admin para autorizar)
export async function createAdminUser(req: Request, res: Response): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { adminUsername, adminPassword, username, gmail, password, birthday } = req.body;

    // Verificar que quien crea el admin es un admin
    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

    const newAdmin: Partial<IUsuario> = { username, gmail, password, birthday };
    const adminUser = await userService.createAdminUser(newAdmin);
    return res.status(201).json({
      message: 'Usuario administrador creado exitosamente',
      user: adminUser
    });
  } catch (error) {
    return res.status(500).json({ error: 'FALLO AL CREAR EL USUARIO ADMINISTRADOR' });
  }
}

// NUEVO: Crear primer admin (no requiere autenticación, solo si no hay admins en el sistema)
export async function createFirstAdmin(req: Request, res: Response): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verificar si ya existe algún admin
    const hasAdmin = await userService.hasAnyAdmin();
    if (hasAdmin) {
      return res.status(400).json({ 
        message: 'Ya existen administradores en el sistema. Usa el endpoint regular de creación de admins.' 
      });
    }

    const { username, gmail, password, birthday } = req.body;
    const newAdmin: Partial<IUsuario> = { username, gmail, password, birthday };
    const adminUser = await userService.createAdminUser(newAdmin);
    
    return res.status(201).json({
      message: 'PRIMER USUARIO ADMINISTRADOR CREADO EXITOSAMENTE',
      user: adminUser
    });
  } catch (error) {
    return res.status(500).json({ error: 'FALLO AL CREAR EL PRIMER ADMINISTRADOR' });
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
    const { adminUsername, adminPassword } = req.body;
    
    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

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
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

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
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

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
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

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
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

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

export async function makeUserAdmin(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

    const adminUser = await userService.makeUserAdmin(id);
    if (!adminUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Usuario convertido en administrador',
      user: adminUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function removeUserAdmin(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

    const normalUser = await userService.removeUserAdmin(id);
    if (!normalUser) return res.status(404).json({ message: 'USUARIO NO ENCONTRADO' });
    return res.status(200).json({ 
      message: 'Permisos de administrador removidos',
      user: normalUser 
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

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
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(401).json({ message: 'Se requieren credenciales de administrador' });
    }

    const isAdmin = await verifyAdmin(adminUsername, adminPassword);
    if (!isAdmin) {
      return res.status(403).json({ message: 'NO TIENES PERMISOS DE ADMINISTRADOR' });
    }

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

export async function loginBackoffice(req: Request, res: Response): Promise<Response> {
  console.log('login backoffice');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { username, password } = req.body;
    
    const user = await userService.loginAdmin(username, password);
    if (!user) {
      return res.status(401).json({ 
        message: 'CREDENCIALES INCORRECTAS O NO TIENES PERMISOS DE ADMINISTRADOR' 
      });
    }

    return res.status(200).json({
      message: 'LOGIN BACKOFFICE EXITOSO',
      user: removePassword(user),
      isAdmin: true
    });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR EN EL LOGIN BACKOFFICE' });
  }
}