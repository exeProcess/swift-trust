module.exports = (sequelize, DataTypes) => {
  const Employment = sequelize.define('Employment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employerName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employerAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return Employment;
};

