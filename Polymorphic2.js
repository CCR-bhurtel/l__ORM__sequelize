class Tag extends Model {
    async getTaggables(options) {
        const images = await this.getImages(options);
        const videos = await this.getVideos(options);
        // Concat images and videos in a single array of taggables
        return images.concat(videos);
    }
}
Tag.init(
    {
        name: DataTypes.STRING,
    },
    { sequelize, modelName: 'tag' }
);

// Here we define the junction model explicitly
class Tag_Taggable extends Model {}
Tag_Taggable.init(
    {
        tagId: {
            type: DataTypes.INTEGER,
            unique: 'tt_unique_constraint',
        },

        taggableId: {
            type: DataTypes.INTEGER,
            unique: 'tt_unique_constraint',
            references: null,
        },

        taggableType: {

            type: DataTypes.STRING,
            unique: 'tt_unique_constraint',

            
        },
    },
    { sequelize, modelName: 'tag_taggable' }
);

Image.belongsToMany(Tag, {
    through: {
        model: Tag_Taggable,
        unique: false,
        scope: {
            taggableType: 'image',
        },
    },
    foreignKey: 'taggableId',
    constraints: false,
});
Tag.belongsToMany(Image, {
    through: {
        model: Tag_Taggable,
        unique: false,
    },
    foreignKey: 'tagId',
    constraints: false,
});

Video.belongsToMany(Tag, {
    through: {
        model: Tag_Taggable,
        unique: false,
        scope: {
            taggableType: 'video',
        },
    },
    foreignKey: 'taggableId',
    constraints: false,
});
Tag.belongsToMany(Video, {
    through: {
        model: Tag_Taggable,
        unique: false,
    },
    foreignKey: 'tagId',
    constraints: false,
});
