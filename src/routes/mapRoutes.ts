import { Router } from 'express';
import {
  updateLocation,
  setVisibility,
  getNearbyUsers,
  getFriendsNearby,
  getNearbyEvents,
  getNearbyBusinessesOnly,
  getAllMapData,
  getBusinessesInArea,
  getNearbyBusinessesByCoordinates
} from '../controller/mapController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * /api/map/location:
 *   post:
 *     summary: Update user location
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: [longitude, latitude]
 *               - type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.post('/location', authenticateToken, updateLocation);

/**
 * @swagger
 * /api/map/visibility:
 *   patch:
 *     summary: Set user visibility on map
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVisible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Visibility updated successfully
 */
router.patch('/visibility', authenticateToken, setVisibility);

/**
 * @swagger
 * /api/map/nearby/users:
 *   get:
 *     summary: Get nearby users
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nearby users retrieved successfully
 */
router.get('/nearby/users', authenticateToken, getNearbyUsers);

/**
 * @swagger
 * /api/map/nearby/friends:
 *   get:
 *     summary: Get nearby friends
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nearby friends retrieved successfully
 */
router.get('/nearby/friends', authenticateToken, getFriendsNearby);

/**
 * @swagger
 * /api/map/nearby/events:
 *   get:
 *     summary: Get nearby events from an event location
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID to use as center
 *     responses:
 *       200:
 *         description: Nearby events retrieved successfully
 */
router.get('/nearby/events', authenticateToken, getNearbyEvents);

/**
 * @swagger
 * /api/map/nearby/businesses-only:
 *   get:
 *     summary: Get nearby businesses from a business location
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         required: true
 *         description: Business ID to use as center
 *     responses:
 *       200:
 *         description: Nearby businesses retrieved successfully
 */
router.get('/nearby/businesses-only', authenticateToken, getNearbyBusinessesOnly);

/**
 * @swagger
 * /api/map/businesses/all:
 *   get:
 *     summary: Obtener todos los negocios y eventos para el mapa
 *     tags: [Map - Businesses]
 *     responses:
 *       200:
 *         description: Todos los negocios y eventos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businesses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       location:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                       events:
 *                         type: array
 *                       avatar:
 *                         type: string
 *                       address:
 *                         type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/businesses/all', getAllMapData);

/**
 * @swagger
 * /api/map/businesses/area:
 *   get:
 *     summary: Obtener negocios en un área específica del mapa (viewport)
 *     tags: [Map - Businesses]
 *     parameters:
 *       - in: query
 *         name: minLng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud mínima del área visible
 *       - in: query
 *         name: minLat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud mínima del área visible
 *       - in: query
 *         name: maxLng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud máxima del área visible
 *       - in: query
 *         name: maxLat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud máxima del área visible
 *     responses:
 *       200:
 *         description: Negocios dentro del área especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businesses:
 *                   type: array
 *       400:
 *         description: Parámetros faltantes o inválidos
 */
router.get('/businesses/area', getBusinessesInArea);

/**
 * @swagger
 * /api/map/businesses/nearby:
 *   get:
 *     summary: Obtener negocios cercanos a coordenadas específicas
 *     tags: [Map - Businesses]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud del punto central
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud del punto central
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 5000
 *         description: Radio de búsqueda en metros
 *     responses:
 *       200:
 *         description: Negocios cercanos a las coordenadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businesses:
 *                   type: array
 *       400:
 *         description: Coordenadas requeridas
 */
router.get('/businesses/nearby', getNearbyBusinessesByCoordinates);

export default router;