const { DataTypes, Sequelize, Model, Transaction } = require('sequelize');
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
const getFirstUpperCase = (value) => `${value[0].toUpperCase() + value.substring(1)}`;
class Image extends Model {}

class Video extends Model {}

class Comment extends Model {
    getCommentable(options) {
        console.log(this.commentableType);
        if (!this.commentableType) {
            return Promise.resolve(null);
        }

        const methodName = `get${getFirstUpperCase(this.commentableType)}`;
        console.log(methodName);
        return this[methodName](options);
    }
}

Image.init({ source: DataTypes.STRING, altText: DataTypes.STRING }, { sequelize, modelName: 'image' });
Video.init({ source: DataTypes.STRING, length: DataTypes.INTEGER }, { sequelize, modelName: 'video' });
Comment.init(
    { text: DataTypes.STRING, commentableType: { type: DataTypes.ENUM, values: ['image', 'video'] } },
    { sequelize, modelName: 'comment' }
);

Image.hasMany(Comment, { constraints: false, foreignKey: 'commentableId', scope: { commentableType: 'video' } });
Comment.belongsTo(Image, { foreignKey: 'commentableId' });

Video.hasMany(Comment, { constraints: false, foreignKey: 'commentableId', scope: { commentableType: 'video' } });
Comment.belongsTo(Video, { foreignKey: 'commentableId' });

Comment.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
        if (instance.commentableType === 'image' && instance.image !== undefined) {
            instance.commentable = instance.image;
        } else if (instance.commentableType === 'video' && instance.video !== undefined) {
            instance.commentable = instance.video;
        }
        delete instance.video;
        delete instance.dataValues.video;
        delete instance.image;
        delete instance.dataValues.image;
    }
});
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
        // const video1 = await Video.create({ source: 'https://www.video.com/1234fsd', length: 20 }, { transaction: t });
        // const video2 = await Video.create({ source: 'https://www.video.com/234f32f', length: 10 }, { transaction: t });
        // const image1 = await Image.create(
        //     {
        //         source: 'https://www.image.com/234fss',
        //         altText: 'image of a man holding a cat',
        //     },
        //     { transaction: t }
        // );
        // const image2 = await Image.create(
        //     {
        //         source: 'https://www.image.com/2323fss',
        //         altText: 'image of a man holding a dog',
        //     },
        //     { transaction: t }
        // );

        // const comment1 = await Comment.create({ text: 'wow amazing!', commentableType: 'video' }, { transaction: t });
        // const comment2 = await Comment.create(
        //     { text: 'great content. Thanks.', commentableType: 'video' },
        //     { transaction: t }
        // );
        // const comment3 = await Comment.create(
        //     { text: 'I think that is not true', commentableType: 'image' },
        //     { transaction: t }
        // );
        // const comment4 = await Comment.create({ text: 'I think so', commentableType: 'image' }, { transaction: t });

        // video1.addComment(comment1);
        // video2.addComment(comment2);
        // image1.addComment(comment3);
        // image2.addComment(comment4);
        const comment1 = await Comment.findOne({ where: { id: 33 } });
        
        console.log((await comment1.getCommentable()).toJSON());
    } catch (e) {
        console.log(e);
        t.rollback();
    }
    t.commit();
});
