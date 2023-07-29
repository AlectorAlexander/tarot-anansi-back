module.exports = {
  async up(db, client) {
    // Criação da coleção "notifications"
    await db.createCollection('notifications');

    // Criação de índices para os campos relevantes
    await db.collection('notifications').createIndex({ user_id: 1 });
    await db.collection('notifications').createIndex({ notification_date: 1 });
    await db.collection('notifications').createIndex({ message: 1 });
    await db.collection('notifications').createIndex({ read: 1 });
    await db.collection('notifications').createIndex({ date_creation: 1 });
    await db.collection('notifications').createIndex({ date_update: 1 });
  },

  async down(db, client) {
    // Reverter a migração, removendo a coleção "notifications"
    await db.dropCollection('notifications');
  },
};
