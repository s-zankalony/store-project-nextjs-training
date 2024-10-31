'use server';

import db from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { imageSchema, productSchema, validateWithZodSchema } from './schemas';
import { ZodSchema } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';

export const fetchFeaturedProducts = async () => {
  const products = await db.product.findMany({
    where: {
      featured: true,
    },
  });
  return products;
};

export const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) redirect('/');
  return user;
};

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : 'an error occurred',
  };
};

export const fetchAllProducts = ({ search = '' }: { search: string }) => {
  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const fetchSingleProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (!product) redirect('/products');
  return product;
};

export const createProductAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get('image') as File;
    const validatedFields = validateWithZodSchema(productSchema, rawData);
    const validateFile = validateWithZodSchema(imageSchema, { image: file });

    console.log(validateFile);
    // added by copilot
    let imagePath = '/images/default.jpg';
    if (file) {
      // generate a unique filename
      const fileExt = path.extname(file.name);
      const uniqueName = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2)}${fileExt}`;
      // define the upload directory
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      // ensure the upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // save the file
      const buffer = Buffer.from(await file.arrayBuffer());
      const savePath = path.join(uploadDir, uniqueName);
      await fs.writeFile(savePath, buffer);

      // update imagePath
      imagePath = `/uploads/${uniqueName}`;
    }

    await db.product.create({
      data: {
        ...validatedFields,
        image: '/images/product-1.jpg',
        clerkId: user.id,
      },
    });

    return { message: 'product created' };
  } catch (error) {
    return renderError(error);
  }
};
