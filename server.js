const { Sequelize, DataTypes, Deferrable, Model, Op, QueryTypes } = require('sequelize');
const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

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
            validate: {
                isAlpha: true,
            },
        },
        branch: {
            type: DataTypes.STRING(50),
            validate: {
                isAlpha: true,
                isIn: {
                    args: [['new road', 'tangol', 'jawalakhel', 'damak', 'bhalwari', 'chitwan']],
                    mgs: 'Dont put in random branches',
                },
            },
        },
        amount: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: true,
                isIn: [],
                isRich(value) {
                    if (value > 5000) {
                        throw new TypeError('Rich people are not allowed');
                    }
                },
            },
        },
        account_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        gender: {
            type: DataTypes.STRING(5),
            validate: {
                isIn: [['m', 'f', 'male', 'female', 'others']],
                notIn: {
                    args: [['l', 'g', 'b', 't', 'q']],
                    msg: 'Lgbtq are not allowed',
                },
            },
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

    // By default the objects returned from queries are instances of sequelize Model, adding raw : true makes them simple js object
    // limit offset and find
    // const [results, metadata] = await sequelize.query('SELECT * FROM accounts where amount > 6000');
    const results = await sequelize.query('SELECT * FROM accounts where branch IN(:branches)', {
        replacements: {
            branches: ['bhalwari', 'new road'],
        },
        type: QueryTypes.SELECT,
        // model: Account,
        raw: true,

        // mapToMode                                       l: true, // make instance of accoount model
    });

    const accounts = await Account.findAndCountAll({ limit: 5 });
    console.log(accounts.count);
})();



// process.on('uncaughtException', () => {
//     sequelize.close();
//     process.exit(1);
// });

// process.on('unhandledRejection', () => {
//     sequelize.close();
//     process.exit(1);
// });
