import dotenv from 'dotenv';

dotenv.config();

export interface AiSearchResult {
    eventIds: string[];
}

export class AiService {
    private apiKey: string;
    private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
    }

    async analyzeQuery(userQuery: string): Promise<AiSearchResult> {
        try {
            const weaviateClient = (await import('../config/weaviate')).default;

            const result = await weaviateClient.graphql
                .get()
                .withClassName('Event')
                .withFields('eventId name description category _additional { certainty }')
                .withNearText({ concepts: [userQuery] })
                .withLimit(10)
                .do();

            const foundEvents = result.data.Get.Event;

            if (!foundEvents || foundEvents.length === 0) {
                console.log('[AiService] No candidates found in Weaviate (before filtering).');
                return { eventIds: [] };
            }

            console.log(`[AiService] Found ${foundEvents.length} candidates before filtering. Scores:`);
            foundEvents.forEach((e: any) => console.log(` - ${e.name} (${e.category}): ${e._additional.certainty}`));

            const relevantEvents = foundEvents
                .filter((e: any) => e._additional.certainty > 0.55)
                .map((e: any) => e.eventId);

            console.log(`[AiService] Semantic search found ${relevantEvents.length} events for query: "${userQuery}"`);

            return { eventIds: relevantEvents };

        } catch (error) {
            console.error('[AiService] Error in semantic search:', error);
            return { eventIds: [] };
        }
    }

    async generateResponse(userQuery: string, events: any[]): Promise<string> {
        if (!this.apiKey || this.apiKey === 'PENDING') {
            return "Aquí tienes los eventos que he encontrado:";
        }

        try {
            const eventNames = events.map(e => e.name).join(', ');
            const context = events.length > 0
                ? `Encontré estos eventos: ${eventNames}`
                : "No encontré eventos exactos pero mostraré lo más cercano.";

            const prompt = `
            Eres un asistente de eventos "cool" y amable llamado NightUp AI.
            El usuario preguntó: "${userQuery}".
            ${context}
            
            Genera una respuesta CORTA (una frase o dos) para introducir estos resultados al usuario.
            Sé variado, natural y entusiasta. No uses siempre la misma fórmula.
            Ejemplos de tono: "¡Mira lo que tengo para ti!", "Uff, estos planes pintan bien...", "He encontrado esto que encaja contigo:".
            
            Respuesta:
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
                        { role: "system", content: "You are a helpful, dynamic event assistant." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.9
                })
            });

            const data = await response.json();
            return data.choices[0]?.message?.content || "Aquí tienes algunos eventos:";

        } catch (error) {
            console.error('[AiService] Error generating response:', error);
            return "He encontrado estos eventos para ti:";
        }
    }
}
