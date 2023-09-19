const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;
