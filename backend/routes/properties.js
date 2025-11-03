import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Property from '../models/Property.js';

const router = express.Router();

router.get('/properties', authMiddleware, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id });
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
