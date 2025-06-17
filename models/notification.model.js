module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('unread', 'read'),
      defaultValue: 'unread'
    },
  });

  Notification.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());

    if (values.createdAt) {
      values.createdAt = moment(values.createdAt).format('DD-MM-YYYY');
    }

    return values;
  };
  return Notification;
};

