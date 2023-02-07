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
