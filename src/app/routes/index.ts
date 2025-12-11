import express from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/user/user.routes';
import { eventRoutes } from '../modules/event/event.routes';
import { reviewRoutes } from '../modules/review/review.routes';
import { hostRoutes } from '../modules/host/host.routes';
import { participantRoutes } from '../modules/participants/participants.routes';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRoutes
    },
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/host',
        route: hostRoutes
    },
    {
        path: '/event',
        route: eventRoutes
    },
    {
        path: '/participants',
        route: participantRoutes
    },
    {
        path: '/review',
        route: reviewRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;