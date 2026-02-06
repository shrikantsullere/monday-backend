const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Board, Item, Group, User } = require('../models');
const { Op } = require('sequelize');

// @route   GET api/search
// @desc    Search across all boards and items
router.get('/', auth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ boards: [], items: [] });

  try {
    const boards = await Board.findAll({
      where: {
        name: { [Op.like]: `%${q}%` }
      }
    });

    const items = await Item.findAll({
      where: {
        name: { [Op.like]: `%${q}%` }
      },
      include: [
        {
          model: Group,
          include: [{ model: Board }]
        }
      ]
    });

    res.json({ boards, items });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
