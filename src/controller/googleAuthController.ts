import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { generateToken, generateRefreshToken } from '../auth/token';
import { UserService } from '../services/userServices';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const userService = new UserService();

function removePassword(user: any) {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
}

export const googleAuth = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Google token is required' });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new Error('GOOGLE_CLIENT_ID not configured in environment variables');
        }

        console.log('[GOOGLE AUTH] Verifying Google token...');

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        
        if (!payload) {
            console.error('[GOOGLE AUTH] Invalid Google token payload');
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const { sub: googleId, email, name, picture, locale } = payload;

        console.log('👤 [GOOGLE AUTH] Google payload:', { 
            googleId, 
            email, 
            name: name?.substring(0, 20) + '...' 
        });

        const user = await userService.findOrCreateUserByGoogle({
            googleId,
            email,
            name,
            picture,
            locale
        });

        console.log('[GOOGLE AUTH] User found/created:', user._id);

        const jwtToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        const safeUser = removePassword(user);

        console.log('[GOOGLE AUTH] Google authentication successful');

        return res.status(200).json({
            user: safeUser,
            message: 'GOOGLE_LOGIN_SUCCESSFUL',
            token: jwtToken,
            refreshToken
        });

    } catch (error) {
        console.error('[GOOGLE AUTH] Error:', error);
        return res.status(500).json({ 
            error: 'Google authentication failed',
            details: (error as Error).message 
        });
    }
};

export const connectGoogleAccount = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).user.id;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Google token is required' });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new Error('GOOGLE_CLIENT_ID not configured');
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        
        if (!payload) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const { sub: googleId, email, name, picture, locale } = payload;

        const user = await userService.connectGoogleAccount(userId, {
            googleId,
            email,
            name,
            picture,
            locale
        });

        const safeUser = removePassword(user);

        return res.status(200).json({
            user: safeUser,
            message: 'GOOGLE_ACCOUNT_CONNECTED'
        });

    } catch (error) {
        console.error('Connect Google account error:', error);
        return res.status(500).json({ 
            error: 'Failed to connect Google account',
            details: (error as Error).message 
        });
    }
};

export const disconnectGoogleAccount = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).user.id;
        
        const user = await userService.disconnectGoogleAccount(userId);
        const safeUser = removePassword(user);

        return res.status(200).json({
            user: safeUser,
            message: 'GOOGLE_ACCOUNT_DISCONNECTED'
        });

    } catch (error) {
        console.error('Disconnect Google account error:', error);
        return res.status(500).json({ 
            error: 'Failed to disconnect Google account',
            details: (error as Error).message 
        });
    }
};