import express from 'express';
import { getAllProvinces, getProvinceById } from '../controllers/provinces';
const router = express.Router();

router.get('/', getAllProvinces);
router.get('/provinceId/:provinceId', getProvinceById);
// router.post('/', [postRecord]);

router.stack.forEach(function (middleware) {
  if (middleware.route) {
    console.log(
      '[routes]: ' + middleware.route.stack[0].method.toUpperCase() + ' /api/v1/provinces' + middleware.route.path
  );}
});

export { router };
