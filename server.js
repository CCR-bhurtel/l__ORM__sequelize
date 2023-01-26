const { Sequelize, DataTypes, Deferrable, Model, Op } = require('sequelize');
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
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);
class Account extends Model {}
Account.init(
    {
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        branch: {
            type: DataTypes.STRING(50),
        },
        amount: {
            type: DataTypes.INTEGER,
        },
        account_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        gender: {
            type: DataTypes.STRING(5),
        },
    },
    { sequelize, initialAutoIncrement: 10, freezeTableName: true, tableName: 'accounts' }
);

const connectAndSyncDb = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({});
        // force: true, match: /^test/
        console.log('Database connected and synced');
    } catch (err) {
        console.log(err);
        sequelize.close();
        process.exit(1);
    }
};
(async () => {
    await connectAndSyncDb();
    const accounts = await Account.findAll({
        attributes: ['branch', 'username', [sequelize.fn('SUM', sequelize.col('amount')), 'sum']],
        group: ['branch', 'username'],

        rollup: true,
    });
    console.log(JSON.stringify(accounts));
    // const accounts = await Account.findAll();
})();

// process.on('uncaughtException', () => {
//     sequelize.close();
//     process.exit(1);
// });

// process.on('unhandledRejection', () => {
//     sequelize.close();
//     process.exit(1);
// });
