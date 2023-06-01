const express = require("express");
const app = express();
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize("employees", "root", "123", {
  host: "localhost",
  dialect: "mysql",
});

const Employee = sequelize.define("Employee", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salary: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  serviceYears: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  retirementDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

app.get("/employee-count", async (req, res) => {
  const { country, minSalary, maxSalary } = req.query;

  try {
    const count = await Employee.count({
      where: {
        country,
        salary: {
          [Op.between]: [minSalary, maxSalary],
        },
      },
    });

    return res.status(200).json({
      status: true,
      data: count,
      message: "Count",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/employee-by-service-year", async (req, res) => {
  try {
    const result = await Employee.findAll({
      attributes: [
        "serviceYears",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: "serviceYears",
    });

    return res.status(200).json({
      status: true,
      data: result,
      message: "Employee by Service year",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/retire-employees", async (req, res) => {
  const today = new Date();
  const fiveYearsFromNow = new Date(
    today.getFullYear() + 5,
    today.getMonth(),
    today.getDate()
  );

  try {
    const retireEmployees = await Employee.findAll({
      where: {
        retirementDate: {
          [Op.lte]: fiveYearsFromNow,
        },
      },
    });

    return res.status(200).json({
      status: true,
      data: retireEmployees,
      message: "Employees going to Retire in the next 5 years",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/high-paid-employees", async (req, res) => {
  try {
    const highPaidEmployees = await Employee.findAll({
      where: {
        [Op.or]: [
          {
            serviceYears: { [Op.lt]: 5 },
            salary: { [Op.gt]: 10000 },
          },
          {
            serviceYears: { [Op.lt]: 8 },
            salary: { [Op.gt]: 12000 },
          },
        ],
      },
      attributes: ["name", "position", "department"],
    });

    return res.status(200).json({
      status: true,
      data: highPaidEmployees,
      message: "High-Paid Employees",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
