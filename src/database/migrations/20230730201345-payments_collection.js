module.exports = {
  async up(db, client) {
    await db.createCollection('payments');
    await db.collection('schedule_id').createIndex({ schedule_id: 1 });
    await db.collection('price').createIndex({ price: 1 });
    await db.collection('status').createIndex({ status: 1 });
    await db.collection('date_creation').createIndex({ date_creation: 1 });
    await db.collection('date_update').createIndex({ date_update: 1 });
  },

  async down(db, client) {
    await db.dropCollection('payments');
  },
};
