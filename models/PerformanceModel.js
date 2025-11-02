import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Student from "./StudentModel.js";

const Performance = sequelize.define("Performance", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  behaviour_discipline: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  academic_performance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  extracurricular_participation: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  punctuality: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_score: {
    type: DataTypes.FLOAT,
  },
  percentage: {
    type: DataTypes.FLOAT,
  },
  grade: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: "performances",
  timestamps: false,
});

Performance.belongsTo(Student, { foreignKey: "student_id" });

export default Performance;