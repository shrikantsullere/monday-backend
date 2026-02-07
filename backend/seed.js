const bcrypt = require('bcryptjs');
require('dotenv').config();
const { User, Board, Group, Item, Notification, sequelize } = require('./models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset DB to ensure clean slate for demo data

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Admin User
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@monday.com',
      password: hashedPassword,
      role: 'Admin',
      status: 'active',
      avatar: 'https://i.pravatar.cc/150?u=admin'
    });
    console.log('Admin user created: admin@monday.com / admin123');

    // 2. Create a Board
    const board = await Board.create({
      name: 'Project Alpha',
      type: 'board',
      workspace: 'Main Workspace'
    });

    // 3. Create a Group
    const group = await Group.create({
      title: 'Development Phase 1',
      color: '#00c875',
      BoardId: board.id
    });

    // 4. Create Items assigned to Admin
    await Item.create({
      name: 'Implement Authentication',
      status: 'Working on it',
      priority: 'High',
      assignedToId: admin.id,
      GroupId: group.id,
      timeline: '2023-10-01 to 2023-10-05'
    });

    await Item.create({
      name: 'Design Database Schema',
      status: 'Done',
      priority: 'Critical',
      assignedToId: admin.id,
      GroupId: group.id,
      timeline: '2023-09-25 to 2023-09-28'
    });

    await Item.create({
      name: 'Frontend API Integration',
      status: 'Stuck',
      priority: 'Medium',
      assignedToId: admin.id,
      GroupId: group.id,
      timeline: '2023-10-06 to 2023-10-10'
    });

    console.log('Sample items created for My Work');

    // 5. Create Notifications for Admin
    await Notification.create({
      content: 'Welcome to your new workspace!',
      isRead: false,
      type: 'system',
      link: '/board',
      UserId: admin.id
    });

    await Notification.create({
      content: 'You were assigned to "Implement Authentication"',
      isRead: false,
      type: 'assignment',
      link: '/my-work',
      UserId: admin.id
    });

    await Notification.create({
      content: 'Project Alpha deadline is approaching',
      isRead: true,
      type: 'deadline',
      link: `/board/${board.id}`,
      UserId: admin.id
    });

    console.log('Sample notifications created');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit();
  }
};

seedData();
