import dotenv from 'dotenv';

dotenv.config();

export interface EventSearchCriteria {
    keywords?: string;
    category?: string;
    date?: Date;
    maxPrice?: number;
    city?: string;
}

export class AiService {
    private apiKey: string;
    private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
    }

    async analyzeQuery(userQuery: string): Promise<EventSearchCriteria> {
        if (!this.apiKey || this.apiKey === 'PENDING') {
            console.warn('[AiService] No AI_API_KEY found, using fallback simple search.');
            return { keywords: userQuery };
        }

        try {
            const dataIn = "hi ha alguna cosa de coding? .... Photography ";

            const prompt = `
            Eres un asistente inteligente para una app de eventos.
            Analiza la siguiente consulta de un usuario y extrae los criterios de búsqueda en formato JSON.
            
            Consulta: "${userQuery}" sobre aquests dades: ${dataIn}

            Reglas:
            1. Corrige errores tipográficos obvios en "keywords" (ej. "Tecnho" -> "Techno").
            2. Para "category", intenta usar UNA de las siguientes etiquetas en INGLÉS si aplica: 
               [techno, house, electronic, dj, production, social, dance, clubbing, festivals, underground, photography, cocktails, bars, networking, marketing, venues, coding, technology, fashion, design, music, events].
               Si la consulta menciona "música" en general, usa "music". Si no encaja clara en ninguna, déjalo vacío.
            3. Para "keywords": Extrae SOLO nombres específicos o términos distintivos. ELIMINA palabras genéricas como "evento", "fiesta", "buscar", "quiero", "barato", "hoy", "fin de semana" o la propia categoría si ya la has extraído. Si no queda nada relevante, déjalo vacío string "".

            Devuelve SOLO un objeto JSON con esta estructura (campos opcionales):
            {
                "keywords": "palabras clave limpias (o string vacío si no hay)",
                "category": "categoría en inglés de la lista anterior",
                "date": "YYYY-MM-DD (si se menciona una fecha específica)",
                "maxPrice": number (ej. 20),
                "city": "nombre de la ciudad o ubicación"
            }
            `;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that outputs JSON. You fix typos, map categories to English tags, and clean keywords." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.1
                })
            });

            if (!response.ok) {
                throw new Error(`AI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = content.substring(jsonStart, jsonEnd + 1);
                const criteria = JSON.parse(jsonStr);

                if (criteria.date) {
                    criteria.date = new Date(criteria.date);
                }
                return criteria;
            }

            return { keywords: userQuery };

        } catch (error) {
            console.error('[AiService] Error analyzing query:', error);
            return { keywords: userQuery };
        }
    }
}
