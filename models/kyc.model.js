module.exports = (sequelize, DataTypes) => {
  const KYC = sequelize.define('KYC', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idCardUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    selfieUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return KYC;
};

