import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';

const router = Router();

router.get('/combinations', BudgetController.getCombinations);

export default router;
