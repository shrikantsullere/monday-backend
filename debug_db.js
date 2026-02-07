const { Item, User, Group, Board } = require('./backend/models');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  try {
    const items = await Item.findAll({
      include: [
        { model: Group, include: [Board] },
        { model: User, as: 'assignedUser' }
      ]
    });
    console.log('Total Items in DB:', items.length);
    items.forEach(item => {
      console.log(`- Item: ${item.name}, Status: ${item.status}, AssignedTo: ${item.assignedToId}, Board: ${item.Group?.Board?.name}`);
    });

    const users = await User.findAll();
    console.log('Total Users:', users.length);
    users.forEach(u => console.log(`- User: ${u.id}, Name: ${u.name}, Email: ${u.email}`));
  } catch (err) {
    console.error(err);
  }
}

check();
