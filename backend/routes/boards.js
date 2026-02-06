const express = require('express');
const router = require('express').Router();
const auth = require('../middleware/auth');
const { Board, Group, Item, User } = require('../models');

// @route   GET api/boards
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.findAll({
      include: [{
        model: Group,
        as: 'Groups',
        include: [{
          model: Item,
          as: 'items',
          include: [
            { model: Item, as: 'subItems' },
            { model: User, as: 'assignedUser', attributes: ['name', 'avatar'] }
          ]
        }]
      }]
    });
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/boards
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });
    const board = await Board.create(req.body);
    // Create a default group
    await Group.create({ title: 'New Group', BoardId: board.id });
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
