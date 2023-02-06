const { Sequelize, DataTypes, Model, Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: '../config.env' });

class Project extends Model {}
Project.init(
    {
        active: DataTypes.BOOLEAN,
        deadline: DataTypes.DATE,
        developers: DataTypes.ARRAY[DataTypes.STRING],
        category: DataTypes.STRING,
        deleted: DataTypes.BOOLEAN,
        points: DataTypes.INTEGER,
    },
    {
        sequelize,
        freezeTableName: true,
        whereMergeStrategy: 'and',
        defaultScope: {
            where: {
                [Op.gt]: { deadline: Date.now() },
            },
        },
        // making query reusable
        scopes: { deleted: { where: { deleted: true } }, limited: { limit: 4 } },
        random() {
            return { where: { category: 'computer science' } };
        },
        accessLevel(value) {
            return { where: { points: { [Op.gt]: value } } };
        },
    }
);
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

connectAndSyncDb().then(async () => {
    await Project.scope('deleted').findAll({
        //....
    });
    await Project.scope({ method: ['accessLevel', 5] }).findAll();
    //  we can also merge two scope together by passing two scopes together
    await Project.scope([{ method: 'deleted' }, { method: 'limited' }]);
});
