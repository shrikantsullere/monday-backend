const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { User } = require('../models');

// @route   GET api/users
// @desc    Get all users
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/users
// @desc    Create a user (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });
    const { name, email, password, role, avatar, phone, address } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name, email, password: hashedPassword, role, avatar, phone, address
    });

    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });
    const { name, email, phone, address, role, status, password } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const updates = { name, email, phone, address, role, status };
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });
    await User.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'User removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
