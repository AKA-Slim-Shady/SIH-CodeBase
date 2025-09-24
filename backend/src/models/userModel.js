import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Department from './departmentModel.js';

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('user', 'government'), allowNull: false, defaultValue: 'user' },
  isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  location: { type: DataTypes.JSON, allowNull: true }, // { name, lat, lng }
  departmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Departments', key: 'id' } },
}, {
  timestamps: true, // auto createdAt and updatedAt
  tableName: 'Users',
});

// Relations
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });

export default User;
