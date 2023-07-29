module.exports = {
  async up(db, client) {
    await db.createCollection('users');

    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db
      .collection('users')
      .createIndex({ google_id: 1 }, { sparse: true });
    await db
      .collection('users')
      .createIndex({ facebook_id: 1 }, { sparse: true });

    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ name: 1 });
    await db.collection('users').createIndex({ password: 1 });
    await db.collection('users').createIndex({ picture: 1 });
  },

  async down(db, client) {
    await db.dropCollection('users');
  },
};
