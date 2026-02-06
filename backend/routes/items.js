const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Item, Notification, Group, Board, User } = require('../models');

// @route   GET api/items/my
// @desc    Get items assigned to the current user
router.get('/my', auth, async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { assignedToId: req.user.id },
      include: [
        {
          model: Group,
          include: [{ model: Board }]
        },
        { model: Item, as: 'parentItem' }
      ]
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/items
router.post('/', auth, async (req, res) => {
  try {
    const item = await Item.create(req.body);

    // If assigned to someone, create notification
    if (req.body.assignedToId) {
      await Notification.create({
        UserId: req.body.assignedToId,
        content: `You have been assigned a new task: ${item.name}`,
        type: 'task_assigned',
        link: `/board`
      });
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/items/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const oldAssigneeId = item.assignedToId;
    await item.update(req.body);

    // If assignment changed, notify new user
    if (req.body.assignedToId && req.body.assignedToId !== oldAssigneeId) {
      await Notification.create({
        UserId: req.body.assignedToId,
        content: `You have been assigned a task: ${item.name}`,
        type: 'task_assigned',
        link: `/board`
      });
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
