const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize();

const queryInterface = sequelize.getQueryInterface();

queryInterface.createTable('Person', {
    name: DataTypes.STRING,
    profession: DataTypes.STRING,
});

queryInterface.addColumn('Person', 'maritalStatus', {
    type: DataTypes.ENUM,
    values: ['single', 'married', 'engaged', 'divorced'],
});

queryInterface.renameColumn('Person', 'profession', 'job');

queryInterface.changeColumn('Person', 'profession', {});
// Assuming we have a table in SQLite created as follows:
queryInterface.createTable('Person', {
    name: DataTypes.STRING,
    isBetaMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    petName: DataTypes.STRING,
    foo: DataTypes.INTEGER,
});

// And we change a column:
queryInterface.changeColumn('Person', 'foo', {
    type: DataTypes.FLOAT,
    defaultValue: 3.14,
    allowNull: false,
});
