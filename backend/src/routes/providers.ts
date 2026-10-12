import {
  type NextFunction,
  type Request,
  type Response,
  Router
} from 'express';

import {
  type ProviderKind,
  saveProviderSchemas
} from '../../../shared/types/providers';
import { getProvider, saveProvider } from '../controllers/provider-controller';
import { authenticateToken } from '../middleware/auth';
import { attachSelectedProperty } from '../middleware/selected-property';
import { validateBody } from '../middleware/validation';

const router = Router();

// Authenticate, then resolve the caller's selected property onto the request.
// Property scope is derived server-side; the client never sends property_id.
router.use(authenticateToken);
router.use(attachSelectedProperty);

// The kinds of provider are the only resources here.
function requireKind(req: Request, res: Response, next: NextFunction) {
  if (!Object.hasOwn(saveProviderSchemas, String(req.params.kind))) {
    return res.status(404).json({ error: 'Unknown kind of provider' });
  }
  next();
}

// Each kind validates its own providers' configuration.
function validateForKind(req: Request, res: Response, next: NextFunction) {
  validateBody(saveProviderSchemas[req.params.kind as ProviderKind])(
    req,
    res,
    next
  );
}

// The selected property's provider of that kind, or null when none is set up
router.get('/:kind', requireKind, getProvider);

// Set up the provider, replace it with another, or update its configuration
router.put('/:kind', requireKind, validateForKind, saveProvider);

export default router;
