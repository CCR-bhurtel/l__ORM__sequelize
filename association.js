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

    { sequelize, freezeTableName: true, tableName: 'cities' }
);

Weather.init(
    {
        maxTemp: DataTypes.INTEGER,
        minTemp: DataTypes.INTEGER,
        date: DataTypes.DATE,
    },
    {
        sequelize,
        freezeTableName: true,
        tableName: 'weather',
    }
);

City.hasMany(Weather, { onDelete: 'RESTRICT', foreignKey: { name: 'city_id' } });
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
    const butwal = await City.findOne({
        where: {
            name: 'Butwal',
        },
        include: [
            {
                model: 'Weather',
                where: {
                    maxTemp: { [Op.gt]: 10 },
                },
            },
        ],
    });
    // console.log(butwal.toJSON());
    const totalWeatherRecordsOfButwal = await butwal.countWeather();
    console.log(totalWeatherRecordsOfButwal);
    // await butwal.createWeather({ maxTemp: 20, minTemp: 12, date: new Date('2023-2-1') });
    // const weather = await Weather.findOne({
    //     where: {
    //         id: 1,
    //     },
    //     include: 'City',
    // });

    // console.log(weather.toJSON());

    // await butwal.setWeather(weather1);

    // await butwal.setWeather(weather2);
    // const city = await City.findOne({
    //     where: {
    //         name: 'Butwal',
    //     },
    //     include: Weather,
    // });
};

(async () => {
    await connectAndSyncDb();

    // const cities = await City.bulkCreate([
    //     { name: 'Kathmandu', population: '2345643' },
    //     { name: 'Pokhara', population: 345333 },
    //     { name: 'Butwal', population: 294564 },
    //     { name: 'Chitwan', population: 234553 },
    //     { name: 'Morang', population: 96724 },
    //     { name: 'Birgunj', population: 654343 },
    //     { name: 'Dang', population: 34643 },
    // ]);
    // const weathers = await Weather.bulkCreate([
    //     { maxTemp: 12, minTemp: 3, date: new Date('2023-1-27') },
    //     { maxTemp: 20, minTemp: 12, date: new Date('2023-1-27') },
    //     { maxTemp: 23, minTemp: 15, date: new Date('2023-1-27') },
    //     { maxTemp: 21, minTemp: 10, date: new Date('2023-1-27') },
    //     { maxTemp: 25, minTemp: 12, date: new Date('2023-1-27') },
    //     { maxTemp: 26, minTemp: 10, date: new Date('2023-1-27') },
    //     { maxTemp: 16, minTemp: 3, date: new Date('2023-1-28') },
    //     { maxTemp: 18, minTemp: 8, date: new Date('2023-1-28') },
    //     { maxTemp: 26, minTemp: 7, date: new Date('2023-1-28') },
    //     { maxTemp: 24, minTemp: 13, date: new Date('2023-1-28') },
    // ]);

    // -----------------------Lazy Loading --------------
    // const city = await City.findOne({
    //     where: {
    //         name: 'Butwal',
    //     },
    // });
    // console.log(city.name);
    // const weather = await city.getWeather();
    // console.log(weather.maxTemp);

    // ----------------------Eager Loading------------------
    // const cityWithWeather = await City.findOne({
    //     where: {
    //         name: 'Butwal',
    //     },
    //     include: 'Weather',
    // });
})();
