import { Router } from 'express';
import { getRoles } from '../controllers/roles-controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getRoles);

export default router;
