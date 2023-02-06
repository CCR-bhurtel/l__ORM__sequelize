// [... validation happens ...]

const { DataTypes, Sequelize, Model } = require('sequelize');

// (3)
//   afterValidate(instance, options)
//   validationFailed(instance, options, error)
// (4)
//   beforeCreate(instance, options)
//   beforeDestroy(instance, options)
//   beforeUpdate(instance, options)
//   beforeSave(instance, options)
//   beforeUpsert(values, options)

// [... creation/update/destruction happens ...]

// (5)
//   afterCreate(instance, options)
//   afterDestroy(instance, options)
//   afterUpdate(instance, options)
//   afterSave(instance, options)
//   afterUpsert(created, options)
// (6)
//   afterBulkCreate(instances, options)
//   afterBulkDestroy(options)
//   afterBulkUpdate(options)

class User extends Model {}
User.init(
    {
        username: DataTypes.STRING,
        mood: {
            type: DataTypes.ENUM,
            values: ['happy', 'sad', 'neutral'],
        },
    },
    {
        hooks: {
            beforeValidate: (user, options) => {
                user.mood = 'happy';
            },
            afterValidate: (user, options) => {
                user.username = 'Toni';
            },
        },
        sequelize,
    }
);

// Method 2 via the .addHook() method
User.addHook('beforeValidate', (user, options) => {
    user.mood = 'happy';
});

User.addHook('afterValidate', 'someCustomName', (user, options) => {
    return Promise.reject(new Error("I'm afraid I can't let you do that!"));
});

// Method 3 via the direct method
User.beforeCreate(async (user, options) => {
    const hashedPassword = await hashPassword(user.password);
    user.password = hashedPassword;
});

User.afterValidate('myHookAfter', (user, options) => {
    user.username = 'Toni';
});
