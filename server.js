const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = express();

// database, user, password, {host, dialect}
const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_USER_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: 'postgres',
        logging: () => {
            console.log('Database connected successfully');
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);
const User = sequelize.define(
    'User',
    {
        firstName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
        },
    },
    { freezeTableName: true, tableName: 'users' }
);
const user = new User({ id: 1, firstName: 'shishir', lastName: 'bhurtel' });

User.sync({ force: true }).then(async () => {
    user.save();
});

sequelize
    .authenticate()
    .then(() => {
        app.listen(9000, () => {
            console.log('Server listening to port 9000');
        });
    })
    .catch((err) => {
        console.log(err);
    });

// process.on('uncaughtException', () => {
//     sequelize.close();
//     process.exit(1);
// });

// process.on('unhandledRejection', () => {
//     sequelize.close();
//     process.exit(1);
// });
