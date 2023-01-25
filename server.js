const { Sequelize, DataTypes, Deferrable, Model } = require('sequelize');
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
class Bar extends Model {
    fullName() {
        return this.firstName + ' ' + this.lastName;
    }
}
Bar.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
        },
        lastName: {
            type: DataTypes.STRING,
        },
    },
    { sequelize, freezeTableName: true, tableName: 'bars' }
);
const bar1 = Bar.build({ id: 'dfas', firstName: 'Shishir', lastName: 'Bhurtel' });
console.log(bar1.fullName());
const User = sequelize.define(
    'User',
    {
        id: { type: DataTypes.UUID, primaryKey: true },
        firstName: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: 'ShreeRam',
        },
        lastName: {
            type: DataTypes.STRING,
        },
        uniqueOne: { type: DataTypes.STRING, unique: 'ComposeIndex' },
        uniqueTwo: { type: DataTypes.STRING, unique: 'ComposeIndex' },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        bar_id: {
            type: DataTypes.STRING,
            references: {
                model: 'bars',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE,
            },
        },
    },
    { freezeTableName: true, tableName: 'users' }
);
const connectAndSyncDb = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true, match: /^test/ });
        console.log('Database connected and synced');
    } catch (err) {
        console.log(err);
        sequelize.close();
        process.exit(1);
    }
};

connectAndSyncDb().then(() => {
    app.listen(9000, () => {
        console.log('Server listening to port 9000');
    });
});

// process.on('uncaughtException', () => {
//     sequelize.close();
//     process.exit(1);
// });

// process.on('unhandledRejection', () => {
//     sequelize.close();
//     process.exit(1);
// });
