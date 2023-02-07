const { DataTypes, Sequelize, Model, Transaction } = require('sequelize');
const dotenv = require('dotenv');

const cls = require('cls-hooked');
const namespace = cls.createNamespace('my-own-namespace');

dotenv.config({ path: './config.env' });
Sequelize.useCLS(namespace);
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

class User extends Model {}

class Sibling extends Model {}

User.init(
    {
        name: DataTypes.STRING,
        age: DataTypes.INTEGER,
    },
    { sequelize, freezeTableName: true, tableName: 'elder', timestamps: false }
);

Sibling.init(
    {
        name: DataTypes.STRING,
        age: {
            type: DataTypes.INTEGER,
            validate: {
                ageCheck(value) {
                    if (value > 12) {
                        throw new Error("Sibling's age cannot be greater than 12");
                    }
                },
            },
        },
    },
    { sequelize, freezeTableName: true, tableName: 'sibling', modelName: 'Sibling', timestamps: false }
);
User.Sibling = User.hasOne(Sibling, { foreignKey: 'elderId' });
Sibling.User = Sibling.belongsTo(User);

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
    // unmanaged transaction
    const t = await sequelize.transaction();
    try {
        const elder = await User.create(
            {
                name: 'Shishir',
                age: 20,
            },
            { transaction: t }
        );

        const sibling = await elder.createSibling({ name: 'Sital', age: 10 }, { transaction: t });
    } catch (e) {
        console.log(e);
        await t.rollback();
    }
    await t.commit();
    //  managed transaction
    // try {
    //     const result = sequelize.transaction().then(async (t) => {
    //         const user = await User.create({ name: 'John', age: 15 }, { transaction: t });
    //         const sibling = await user.createSibling({ name: 'Ema', age: 11 }, { transaction: t });
    //         return user;
    //     });
    // } catch (err) {}

    // automatic transaction key for all queries
    sequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        },
        (t1) => {
            console.log(namespace.get('transaction'));
            t1.afterCommit(() => {
                // logic here
            });
        }
    );
});
