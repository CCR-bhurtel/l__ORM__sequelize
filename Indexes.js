const sequelize = require('sequelize');

// types of indexes in postgres includes
// 1> B-Tree (used for range operations, < >, <=, >=)
//  2> Hash (used for equality operations =)
// 3>  GiST << &< &> >> <<| &<| |&> |>> @> <@ ~= && (location operations)
// SELECT * FROM places ORDER BY location <-> point '(101,456)' LIMIT 10;
// 4> SP-GiST
//  5> GIN
// 6> BRIN
const User = sequelize.define(
    'User',
    {
        /* attributes */
    },
    {
        indexes: [
            // Create a unique index on email
            {
                unique: true,
                fields: ['email'],
            },

            // Creates a gin index on data with the jsonb_path_ops operator
            {
                fields: ['data'],
                using: 'gin',
                operator: 'jsonb_path_ops',
            },

            // By default index name will be [table]_[fields]
            // Creates a multi column partial index
            {
                name: 'public_by_author',
                fields: ['author', 'status'],
                where: {
                    status: 'public',
                },
            },

            // A BTREE index with an ordered field
            {
                name: 'title_index',
                using: 'BTREE',
                fields: [
                    'author',
                    {
                        name: 'title',
                        collate: 'en_US',
                        order: 'DESC',
                        length: 5,
                    },
                ],
            },
        ],
    }
);
