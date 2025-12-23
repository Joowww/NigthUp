import { Router } from 'express';
import {
  updateLocation,
  setVisibility,
  getNearbyUsers,
  getFriendsNearby,
  getNearbyEvents,
  getNearbyBusinessesOnly
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

export default router;