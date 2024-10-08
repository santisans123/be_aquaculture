import express from 'express';
import {
  createPondsByUser,
  deletePondsById,
  getAllPonds,
  getAllNoQueryPonds,
  getPondsByCityId,
  getPondsById,
  getPondsByProvinceId,
  updatePondsByUser
} from '../controllers/ponds';
const router = express.Router();

router.get('/', getAllPonds);
router.get('/all-ponds', getAllNoQueryPonds);
router.get('/pondsId/:pondsId', getPondsById);
router.get('/cityId/:cityId', getPondsByCityId);
router.get('/provinceId/:provinceId', getPondsByProvinceId);
router.post('/', [createPondsByUser]);
router.put('/pondsId/:pondsId', [updatePondsByUser]);
router.delete('/pondsId/:pondsId', deletePondsById);

router.stack.forEach(function (middleware) {
  if (middleware.route) {
    console.log('[routes]: ' + middleware.route.stack[0].method.toUpperCase() + ' /api/v1/ponds' + middleware.route.path);
  }
  });

export { router };
