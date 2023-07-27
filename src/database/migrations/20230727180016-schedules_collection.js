module.exports = {
  async up(db, client) {
    // Criação da coleção "schedules"
    await db.createCollection('schedules');

    // Criação de índices para os campos relevantes
    await db.collection('schedules').createIndex({ user_id: 1 });
    await db.collection('schedules').createIndex({ start_date: 1 });
    await db.collection('schedules').createIndex({ end_date: 1 });
    await db.collection('schedules').createIndex({ date_creation: 1 });
    await db.collection('schedules').createIndex({ date_update: 1 });
  },

  async down(db, client) {
    // Reverter a migração, removendo a coleção "schedules"
    await db.dropCollection('schedules');
  },
};
