const reader = require('read-excel-file/node');
const fs = require('fs');
const { Sequelize, DataTypes, Model } = require('sequelize');
const legacy = require('legacy-encoding');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

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

class Cities extends Model {}
Cities.init(
    {
        cities: DataTypes.STRING,
        city_ascii: DataTypes.STRING,
        lat: DataTypes.FLOAT,
        lng: DataTypes.FLOAT,
        country: DataTypes.STRING,
        iso2: DataTypes.STRING,
        iso3: DataTypes.STRING,
        admin_name: DataTypes.STRING,
        capital: DataTypes.STRING,
        population: DataTypes.DOUBLE,
        id: { type: DataTypes.DOUBLE, primaryKey: true },
    },
    { sequelize, freezeTableName: true, tableName: 'cities' }
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
const decoder = (text) => {
    try {
        return legacy.decode(text, 'win1252');
    } catch (err) {
        return null;
    }
};
(async () => {
    await connectAndSyncDb();
    reader(fs.createReadStream('./worldcities.xlsx')).then((rows) => {
        rows.slice(1).forEach(async (row) => {
            try {
                await Cities.create({
                    city: decoder(row[0])?.trim(),
                    city_ascii: decoder(row[1])?.trim(),
                    lat: row[2],

                    lng: row[3],
                    country: decoder(row[4])?.trim(),
                    iso2: decoder(row[5])?.trim(),
                    iso3: decoder(row[6])?.trim(),
                    admin_name: decoder(row[7])?.trim(),
                    capital: decoder(row[8])?.trim(),
                    population: row[9],
                    id: row[10],
                });
            } catch (err) {
                console.log(err);
            }
        });
    });
})();
