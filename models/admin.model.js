const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('staff', 'superadmin'),
      defaultValue: 'staff'
    }
  });

  Admin.beforeCreate(async (admin) => {
    if (admin.password) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }
  });

  Admin.beforeUpdate(async (admin) => {
    if (admin.changed('password')) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }
  });

  return Admin;
};

