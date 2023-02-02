const { Sequelize, Model, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({
    path: './config.env',
});

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_USER_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: 'postgres',
        logging: false,
    }
);

class City extends Model {}

class Weather extends Model {}

City.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        population: {
            type: DataTypes.INTEGER,
            validate: {
                numCount(value) {
                    if (value < 5000) {
                        throw new Error('Population should me more than 5000');
                    }
                },
            },
        },
    },

    { paranoid: true, sequelize, freezeTableName: true, tableName: 'cities' }
);

Weather.init(
    {
        maxTemp: DataTypes.INTEGER,
        minTemp: DataTypes.INTEGER,
        date: DataTypes.DATE,
    },
    { sequelize, freezeTableName: true, tableName: 'weather' }
);

City.hasMany(Weather, { onDelete: 'RESTRICT' });
Weather.belongsTo(City, { onUpdate: 'CASCADE', foreignKey: { name: 'city_id' } });

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
})();
