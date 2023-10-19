module.exports = {
  async up(db, client) {
    await db
      .collection('products')
      .updateMany({}, { $set: { stripe_id: null } }); // Isso define stripe_id como null para todos os documentos existentes
    await db.collection('products').createIndex({ stripe_id: 1 }); // Cria índice para stripe_id
  },

  async down(db, client) {
    await db.collection('products').dropIndex('stripe_id_1'); // Remove índice
    await db
      .collection('products')
      .updateMany({}, { $unset: { stripe_id: 1 } }); // Remove a chave stripe_id de todos os documentos
  },
};
