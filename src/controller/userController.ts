import { Request, Response } from 'express';
import { IUser } from '../models/user';
import User from '../models/user'; 
import { UserService } from '../services/userServices';
import { validationResult } from 'express-validator';
import { generateToken, generateRefreshToken, generateResetToken } from '../auth/token';

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
        return res.status(500).json({ 
            error: 'FAILED TO CREATE USER', 
            details: (error as Error).message 
        });
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

        if (userData.password) {
            return res.status(400).json({ message: 'Password cannot be updated from this endpoint' });
        }

        const userRole = (req as any).user?.role;
        if (userData.role && userRole !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update user roles' });
        }

        if (Object.keys(userData).length === 0) {
            return res.status(400).json({ message: 'No fields to update provided' });
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
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials or user inactive' });
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        const safeUser = removePassword(user);

        return res.status(200).json({ 
            user: safeUser,
            message: 'LOGIN EXITOSO',
            token,
            refreshToken
        });
    } catch (error) {
        return res.status(500).json({ error: 'Login error' });
    }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).user.id;
        const user = await userService.getUserByIdentifier(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const newToken = generateToken(user);
        return res.status(200).json({
            message: 'Nuevo token generado',
            token: newToken
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al generar nuevo token' });
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

export async function getMyProfile(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const user = await userService.getUserByIdentifier(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'USER NOT FOUND' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export async function updateMyProfile(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).user.id;
        const userData = req.body;

        if (userData.password || userData.role) {
            return res.status(400).json({ 
                message: 'Password and role cannot be updated from this endpoint' 
            });
        }

        const filteredData: Partial<IUser> = {};
        
        if (userData.username !== undefined && typeof userData.username === 'string') {
            filteredData.username = userData.username;
        }
        
        if (userData.email !== undefined && typeof userData.email === 'string') {
            filteredData.email = userData.email;
        }
        
        if (userData.birthday !== undefined) {
            const birthday = new Date(userData.birthday);
            if (!isNaN(birthday.getTime())) {
                filteredData.birthday = birthday;
            }
        }

        if (Object.keys(filteredData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update provided' });
        }

        const updatedUser = await userService.updateUserByIdentifier(userId, filteredData);
        if (!updatedUser) return res.status(404).json({ message: 'USER NOT FOUND' });

        return res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

export const verifyTokenHandler = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user = (req as any).user;
        return res.status(200).json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error verifying token' });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
        }

        const resetToken = generateResetToken(user);
        
        // En producción, aquí enviarías un email real
        console.log(`Reset password link: http://localhost:4200/reset-password?token=${resetToken}`);
        
        // En un entorno real, guardarías el token en la base de datos
        // user.resetToken = resetToken;
        // user.resetTokenExpiry = Date.now() + 3600000; // 1 hora
        // await user.save();

        return res.status(200).json({ 
            message: 'If the email exists, a reset link has been sent.',
            // En desarrollo, devolvemos el token para pruebas
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentPasswordValid = await (user as any).comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
};

export const changeEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ error: 'New email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await (user as any).comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    user.email = newEmail;
    await user.save();

    const safeUser = removePassword(user);

    return res.status(200).json({ 
      message: 'Email changed successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Error changing email:', error);
    return res.status(500).json({ error: 'Failed to change email' });
  }
};