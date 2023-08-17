module.exports = {
  async up(db, client) {
    await db.createCollection('sections');
    await db.collection('schedule_id').createIndex({ schedule_id: 1 });
    await db.collection('date_section').createIndex({ date_section: 1 });
    await db.collection('price').createIndex({ price: 1 });
    await db.collection('date_creation').createIndex({ date_creation: 1 });
    await db.collection('date_update').createIndex({ date_update: 1 });
  },

  async down(db, client) {
    await db.dropCollection('sections');
  },
};
