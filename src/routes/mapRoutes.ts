import { Router } from 'express';
import {
  updateLocation,
  setVisibility,
  getNearbyUsers,
  getNearbyBusinesses,
  getFriendsNearby
} from '../controller/mapController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LocationUpdate:
 *       type: object
 *       required:
 *         - latitude
 *         - longitude
 *       properties:
 *         latitude:
 *           type: number
 *           example: 40.7128
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           example: -74.0060
 *           description: Longitude coordinate
 *     VisibilityUpdate:
 *       type: object
 *       required:
 *         - isVisible
 *       properties:
 *         isVisible:
 *           type: boolean
 *           example: true
 *           description: Whether user is visible on map
 *     NearbyUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         username:
 *           type: string
 *           description: Username
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: "Point"
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-74.0060, 40.7128]
 *         distance:
 *           type: number
 *           description: Distance in meters
 *         lastLocationUpdate:
 *           type: string
 *           format: date-time
 */

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
 *             $ref: '#/components/schemas/LocationUpdate'
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ubicación actualizada correctamente"
 *                 location:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "Point"
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [-74.0060, 40.7128]
 *       400:
 *         description: Invalid coordinates
 *       401:
 *         description: Unauthorized - Token required
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
 *             $ref: '#/components/schemas/VisibilityUpdate'
 *     responses:
 *       200:
 *         description: Visibility updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Visibilidad actualizada correctamente"
 *                 isVisibleOnMap:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
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
 *     parameters:
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 1000
 *         description: Search radius in meters
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Maximum number of users to return
 *     responses:
 *       200:
 *         description: Nearby users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NearbyUser'
 *                 total:
 *                   type: number
 *                   description: Total number of users found
 *       400:
 *         description: User location not available
 *       401:
 *         description: Unauthorized - Token required
 */
router.get('/nearby/users', authenticateToken, getNearbyUsers);

/**
 * @swagger
 * /api/map/nearby/businesses:
 *   get:
 *     summary: Get nearby businesses/events
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 2000
 *         description: Search radius in meters
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by event category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Maximum number of businesses to return
 *     responses:
 *       200:
 *         description: Nearby businesses retrieved successfully
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
 *                             example: "Point"
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                       category:
 *                         type: string
 *                       distance:
 *                         type: number
 *                         description: Distance in meters
 *                 total:
 *                   type: number
 *                   description: Total number of businesses found
 *       400:
 *         description: User location not available
 *       401:
 *         description: Unauthorized - Token required
 */
router.get('/nearby/businesses', authenticateToken, getNearbyBusinesses);

/**
 * @swagger
 * /api/map/nearby/friends:
 *   get:
 *     summary: Get nearby friends
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Search radius in meters
 *     responses:
 *       200:
 *         description: Nearby friends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NearbyUser'
 *                 total:
 *                   type: number
 *                   description: Total number of friends found nearby
 *       400:
 *         description: User location not available
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: No friends found nearby
 */
router.get('/nearby/friends', authenticateToken, getFriendsNearby);

export default router;