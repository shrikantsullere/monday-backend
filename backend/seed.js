const bcrypt = require('bcryptjs');
require('dotenv').config();
const { User, sequelize } = require('./models');

const seedAdmin = async () => {
  try {
    await sequelize.sync({ alter: true });

    const adminEmail = 'admin@monday.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        status: 'active'
      });
      console.log('Admin user created: admin@monday.com / admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    process.exit();
  }
};

seedAdmin();
