import { Request, Response } from 'express';

export async function searchMusic(req: Request, res: Response): Promise<Response> {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query as string)}&limit=20&media=music`;

        const response = await fetch(url);
        const data = await response.json();

        // Mapeamos para que coincida con lo que el frontend espera si es necesario
        // Pero el requerimiento dice "retornar el JSON"
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in music proxy:', error);
        return res.status(500).json({
            error: 'Failed to fetch music from iTunes',
            details: (error as Error).message
        });
    }
}
