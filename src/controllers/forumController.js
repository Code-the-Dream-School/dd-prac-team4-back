const Forum = require('../models/Forum');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new CustomError.BadRequestError('Room name is required');
    }

    const existingRoom = await Forum.findOne({ name });

    if (existingRoom) {
      throw new CustomError.ConflictError('Room with this name already exists');
    }

    const newRoom = await Forum.create({ name });
    res.status(StatusCodes.CREATED).json(newRoom);
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Forum.find({});
    res.status(StatusCodes.OK).json(rooms);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new CustomError.BadRequestError('Room ID is required');
    }

    const room = await Forum.findById(roomId);

    if (!room) {
      throw new CustomError.NotFoundError('Room not found');
    }

    res.status(StatusCodes.OK).json(room);
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
};
