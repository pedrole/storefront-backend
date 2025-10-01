import client from '../database';

const seedProducts = async () => {
  try {
    const conn = await client.connect();

    // Check if products already exist
    const existingProducts = await conn.query('SELECT COUNT(*) FROM products');
    const productCount = parseInt(existingProducts.rows[0].count);

    if (productCount > 0) {
      console.log('Products already exist, skipping product seed...');
      conn.release();
      return;
    }

    // Insert demo products (apenas name, price, image - sem description)
    const products = [
      {
        name: 'Book',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Headphones',
        price: 249.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Backpack',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Notebook',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Phone',
        price: 899.99,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Coffee Mug',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Sunglasses',
        price: 159.99,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        name: 'Watch',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      }
    ];

    for (const product of products) {
      await conn.query(
        'INSERT INTO products (name, price, image) VALUES ($1, $2, $3)',
        [product.name, product.price, product.image]
      );
      console.log(`✅ Created product: ${product.name}`);
    }

    conn.release();
    console.log('🎉 Product seed completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};

export { seedProducts };
