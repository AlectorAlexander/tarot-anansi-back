module.exports = {
  async up(db, client) {
    await db.createCollection('users');

    await db
      .collection('users')
      .createIndex({ id: 1 }, { unique: true, sparse: true });
    await db
      .collection('users')
      .createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ role: 1 }, { sparse: true });
    await db.collection('users').createIndex({ name: 1 }, { sparse: true });
    await db.collection('users').createIndex({ password: 1 }, { sparse: true });
    await db.collection('users').createIndex({ picture: 1 }, { sparse: true });
    await db
      .collection('users')
      .createIndex({ google_id: 1 }, { unique: true, sparse: true });
    await db
      .collection('users')
      .createIndex({ facebook_id: 1 }, { unique: true, sparse: true });

    await db.collection('users').updateMany(
      {},
      {
        $setOnInsert: {
          created_date: new Date(),
        },
        $set: {
          updated_date: new Date(),
          role: null,
          name: null,
          password: null,
          picture: null,
          google_id: null,
          facebook_id: null,
        },
      },
      { upsert: true },
    );
  },

  async down(db, client) {
    await db.dropCollection('users');
  },
};
