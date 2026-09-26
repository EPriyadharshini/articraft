import 'dotenv/config';
import mongoose from 'mongoose';
import { validateEnvironment, config } from './config/env.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import Artist from './models/Artist.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Review from './models/Review.js';
import { demoArtists, demoProducts, demoCategories } from './data/demoData.js';

validateEnvironment();

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Artist.deleteMany({}), Product.deleteMany({}), Category.deleteMany({}), Review.deleteMany({})]);

  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('SEED_PASSWORD must be set to a non-production password of at least 8 characters.');
  }
  await User.create({
    name: 'Articraft Admin',
    email: 'admin@articraft.local',
    password,
    role: 'ADMIN',
  });

  const categories = await Category.insertMany(
    demoCategories.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }))
  );
  const categoryByName = new Map(categories.map((category) => [category.name, category._id]));

  const artistUsers = await Promise.all(
    demoArtists.map((artist) =>
      User.create({
        name: artist.name,
        email: `${artist.name.toLowerCase().replace(/[^a-z]+/g, '.')}@articraft.local`,
        password,
        role: 'ARTIST',
        avatar: artist.avatar,
      })
    )
  );
  const artistRecords = await Artist.insertMany(
    demoArtists.map((artist, index) => ({
      user: artistUsers[index]._id,
      bio: artist.bio,
      location: artist.location,
      specialization: artist.specialization,
      socials: artist.socials,
      rating: 0,
      reviewCount: 0,
    }))
  );
  const artistByName = new Map(artistRecords.map((artist, index) => [demoArtists[index].name, artist._id]));

  const products = Array.from({ length: 20 }, (_value, index) => {
    const source = demoProducts[index % demoProducts.length];
    const copyNumber = Math.floor(index / demoProducts.length) + 1;

    return {
      artist: artistByName.get(source.artist) || artistRecords[index % artistRecords.length]._id,
      name: copyNumber === 1 ? source.name : `${source.name} — Edition ${copyNumber}`,
      slug: copyNumber === 1 ? source.slug : `${source.slug}-edition-${copyNumber}`,
      description: source.description,
      price: source.price + (copyNumber - 1) * 10,
      stock: source.stock + copyNumber,
      category: categoryByName.get(source.category) || categories[index % categories.length]._id,
      material: source.material,
      dimensions: source.dimensions,
      images: source.images.map((url) => ({ url, publicId: url })),
      tags: source.tags,
      rating: 0,
      reviewCount: 0,
      soldCount: 0,
    };
  });
  await Product.insertMany(products);

  console.log('Seed complete.');
};

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
