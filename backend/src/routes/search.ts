import { Router } from 'express';
import { SearchController } from '../controllers/searchController';

const router = Router();

router.get('/', SearchController.search);
router.get('/suggestions', SearchController.suggest);
router.post('/reindex', SearchController.reindex);

export default router;
