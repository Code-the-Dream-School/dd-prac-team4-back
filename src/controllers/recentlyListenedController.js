const RecentlyListened = require('../models/RecentlyListened');

const getRecentlyListenedAlbumsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch recently listened albums for the user, sorted by time in descending order
    const recentlyListened = await RecentlyListened.find({ user: userId })
      .sort({ timeListened: -1 })
      .limit(10); // set the limit to 10 albums

    res.json(recentlyListened);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getRecentlyListenedAlbumsForUser };
