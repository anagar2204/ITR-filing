import { Router } from 'express';
import { testUserController } from '../controllers/testUserController';
import { correctedTestUserController } from '../controllers/correctedTestUserController';

const router = Router();

/**
 * @route GET /api/test-users
 * @description Get all test user profiles
 */
router.get('/', testUserController.getAllTestUsers.bind(testUserController));

/**
 * @route POST /api/test-users/:userId/create
 * @description Create test data for a specific user
 */
router.post('/:userId/create', testUserController.createTestUser.bind(testUserController));

/**
 * @route POST /api/test-users/:userId/test
 * @description Run complete test flow for a specific user
 */
router.post('/:userId/test', testUserController.runCompleteTest.bind(testUserController));

/**
 * @route POST /api/test-users/run-all
 * @description Run all test users and validate accuracy
 */
router.post('/run-all', testUserController.runAllTests.bind(testUserController));

/**
 * @route GET /api/test-users/realistic
 * @description Get all realistic test user profiles
 */
router.get('/realistic', correctedTestUserController.getAllRealisticTestUsers.bind(correctedTestUserController));

/**
 * @route POST /api/test-users/realistic/:userId/create
 * @description Create realistic test data for a specific user
 */
router.post('/realistic/:userId/create', correctedTestUserController.createRealisticTestUser.bind(correctedTestUserController));

/**
 * @route POST /api/test-users/realistic/:userId/test
 * @description Run accurate test for a specific realistic user
 */
router.post('/realistic/:userId/test', correctedTestUserController.runAccurateTest.bind(correctedTestUserController));

/**
 * @route POST /api/test-users/realistic/run-all
 * @description Run all realistic test users with high accuracy validation
 */
router.post('/realistic/run-all', correctedTestUserController.runAllRealisticTests.bind(correctedTestUserController));

export default router;
