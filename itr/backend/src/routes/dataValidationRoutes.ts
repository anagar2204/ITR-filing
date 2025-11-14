import { Router } from 'express';
import { dataValidationController } from '../controllers/dataValidationController';

const router = Router();

/**
 * @route GET /api/data-validation/status
 * @description Get comprehensive data status for a user
 * @query userId
 */
router.get('/status', dataValidationController.getDataStatus.bind(dataValidationController));

/**
 * @route DELETE /api/data-validation/clear
 * @description Clear all data for a user (for testing)
 * @query userId
 */
router.delete('/clear', dataValidationController.clearUserData.bind(dataValidationController));

/**
 * @route POST /api/data-validation/sample
 * @description Add sample data for testing
 * @query userId
 */
router.post('/sample', dataValidationController.addSampleData.bind(dataValidationController));

/**
 * @route POST /api/data-validation/test-flow
 * @description Test complete data flow from input to summary
 * @query userId
 */
router.post('/test-flow', dataValidationController.testDataFlow.bind(dataValidationController));

export default router;
