module.exports = {
  async up(db, client) {
    await db.createCollection('products');
    await db.collection('title').createIndex({ title: 1 });
    await db.collection('description').createIndex({ description: 1 });
    await db.collection('image').createIndex({ image: 1 });
    await db.collection('price').createIndex({ price: 1 });
    await db.collection('date_creation').createIndex({ date_creation: 1 });
    await db.collection('date_update').createIndex({ date_update: 1 });
  },

  async down(db, client) {
    await db.dropCollection('products');
  },
};
