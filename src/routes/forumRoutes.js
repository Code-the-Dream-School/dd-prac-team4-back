const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
} = require('../controllers/forumController');

router.post('/create-room', createRoom);
router.get('/rooms', getRooms);
router.get('/rooms/:roomId', getRoomById);

module.exports = router;
