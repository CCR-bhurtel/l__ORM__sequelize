const { DataTypes, Sequelize, Model } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
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
        define: {
            hooks: {
                beforeBulkCreate() {},
            },
        },
    }
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

const User = sequelize.define('user', {
    name: DataTypes.STRING,
});

const Product = sequelize.define('product', {
    name: DataTypes.STRING,
});

User.hasOne(Product);

Product.belongsTo(User);

connectAndSyncDb().then(async () => {
    const user = await User.create({ name: 'shishir' });
    user.addProduct({ name: 'theexpertsearch' });
});
