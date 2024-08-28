import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { createSlug } from '@/http/utils/creat-slug'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.productTags.deleteMany()
  await prisma.orderItems.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productColor.deleteMany()
  await prisma.productSize.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()

  await prisma.user.create({
    data: {
      email: 'john@acme.com',
      name: 'John Doe',
      password: await hash('123456', 8),
    },
  })

  const productsCategorys = [
    'Electronics',
    'Clothing',
    'Food and Beverages',
    'Beauty Products',
    'Furniture and Home Decor',
    'Toys and Games',
    'Books and Media',
    'Pet Products',
    'Tools and Equipment ',
    'Sports Gear',
  ]

  const productTags = [
    'Eletrônicos',
    'Celulares',
    'Acessórios',
    'Smartphones',
    'Tecnologia',
    'Ofertas',
    'Promoção',
    'Novidades',
    'Gadgets',
    'Inovação',
    'Computadores',
    'Notebooks',
    'Tablets',
    'Consoles',
    'Videogames',
    'Câmeras',
    'Fotografia',
    'Som',
    'Áudio',
    'Fones de Ouvido',
    'Televisores',
    'Smart TVs',
    'Wearables',
    'Relógios Inteligentes',
    'Casa Inteligente',
    'Automação',
    'Iluminação',
    'Segurança',
    'Periféricos',
    'Teclados',
    'Mouses',
    'Armazenamento',
    'SSD',
    'HDD',
    'Memória',
    'Processadores',
    'Placas de Vídeo',
    'Monitores',
    'Impressoras',
    'Scanners',
    'Networking',
    'Roteadores',
    'Modems',
    'Cabo HDMI',
    'Power Bank',
    'Carregadores',
    'Caixas de Som',
    'Suportes',
    'Adaptadores',
    'Case de Proteção',
  ]

  const createdCategories = await Promise.all(
    productsCategorys.map(async (name) => {
      return prisma.productCategory.create({
        data: { name, slug: createSlug(name) },
        select: { id: true },
      })
    }),
  )

  const images = [
    'https://pub-9448e6c9570e405b8072625bd2387965.r2.dev/product_01.png',
    'https://pub-9448e6c9570e405b8072625bd2387965.r2.dev/product_02.png',
    'https://pub-9448e6c9570e405b8072625bd2387965.r2.dev/product_03.png',
    'https://pub-9448e6c9570e405b8072625bd2387965.r2.dev/product_04.png',
  ]

  for (let i = 1; i <= 100; i++) {
    const categoryRandom = numberRandom(10)
    const sku = 'SS' + i.toString().padStart(3, '0')

    const shuffledImages = shuffleArray(images)
    const product = await prisma.product.create({
      data: {
        categoryId: createdCategories[categoryRandom].id,
        description: faker.lorem.words({ min: 3, max: 6 }),
        name: faker.commerce.product(),
        slug: createSlug(faker.commerce.productName() + i),
        images: {
          createMany: {
            data: [
              {
                title: 'imaga-product' + i,
                url: shuffledImages[0],
              },
              {
                title: 'imaga-product' + i + 1,
                url: shuffledImages[1],
              },
              {
                title: 'imaga-product' + i + 2,
                url: shuffledImages[2],
              },
              {
                title: 'imaga-product' + i + 3,
                url: shuffledImages[3],
              },
            ],
          },
        },
      },
    })

    await prisma.productTags.createMany({
      data: [
        {
          productId: product.id,
          name: productTags[Math.floor(Math.random() * productTags.length)],
        },
        {
          productId: product.id,
          name: productTags[Math.floor(Math.random() * productTags.length)],
        },
        {
          productId: product.id,
          name: productTags[Math.floor(Math.random() * productTags.length)],
        },
        {
          productId: product.id,
          name: productTags[Math.floor(Math.random() * productTags.length)],
        },
      ],
    })

    const colors = ['#FF0000', '#0000FF', '#000000', '#FFFFFF']
    const colorName = ['red', 'blue', 'black', 'white']

    const color1Random = numberRandom(4)
    const color1 = await prisma.productColor.create({
      data: {
        color: colors[color1Random],
        name: colorName[color1Random],
        productId: product.id,
      },
    })
    let color2Random: number
    do {
      color2Random = Math.floor(Math.random() * 4)
    } while (color1Random === color2Random)

    const color2 = await prisma.productColor.create({
      data: {
        color: colors[color2Random],
        name: colorName[color2Random],
        productId: product.id,
      },
    })
    const sizes = ['S', 'M', 'L']
    const sizeName = ['small', 'medium', 'large']

    const size1Random = numberRandom(3)
    const size1 = await prisma.productSize.create({
      data: {
        size: sizes[size1Random],
        name: sizeName[size1Random],
        productId: product.id,
      },
    })

    let size2Random: number
    do {
      size2Random = Math.floor(Math.random() * 3)
    } while (size2Random === size1Random)

    const size2 = await prisma.productSize.create({
      data: {
        size: sizes[size2Random],
        name: sizeName[size2Random],
        productId: product.id,
      },
    })

    await prisma.productVariant.createMany({
      data: [
        {
          quantity: faker.number.int({ min: 1, max: 10 }),
          createdAt: randomCreateAt(7),
          colorId: color1.id,
          sku: sku + 1,
          sizeId: size1.id,
          productId: product.id,
          discount: randomDiscout() ? Math.floor(Math.random() * 40) + 1 : null,
          priceInCents: Number(faker.commerce.price({ min: 100, max: 1000 })),
        },
        {
          quantity: faker.number.int({ min: 1, max: 10 }),
          createdAt: randomCreateAt(7),
          colorId: color1.id,
          sku: sku + 2,
          sizeId: size2.id,
          productId: product.id,
          discount: randomDiscout() ? Math.floor(Math.random() * 40) + 1 : null,
          priceInCents: Number(faker.commerce.price({ min: 100, max: 1000 })),
        },
        {
          quantity: faker.number.int({ min: 1, max: 10 }),
          createdAt: randomCreateAt(7),
          colorId: color2.id,
          sku: sku + 3,
          sizeId: size1.id,
          productId: product.id,
          discount: randomDiscout() ? Math.floor(Math.random() * 40) + 1 : null,
          priceInCents: Number(faker.commerce.price({ min: 100, max: 1000 })),
        },
        {
          quantity: faker.number.int({ min: 1, max: 10 }),
          createdAt: randomCreateAt(7),
          colorId: color2.id,
          sku: sku + 4,
          sizeId: size2.id,
          productId: product.id,
          discount: randomDiscout() ? Math.floor(Math.random() * 40) + 1 : null,
          priceInCents: Number(faker.commerce.price({ min: 100, max: 1000 })),
        },
      ],
    })
  }
}

function randomDiscout() {
  const isDiscount = Math.random() > 0.8
  return isDiscount
}

function randomCreateAt(daysBeforeTheCurrentDate: number) {
  const currentDate = new Date()
  const randomDays = Math.floor(Math.random() * daysBeforeTheCurrentDate)

  const randomDate = new Date()
  randomDate.setDate(currentDate.getDate() - randomDays)
  return randomDate
}

function numberRandom(number: number) {
  return Math.floor(Math.random() * number)
}

function shuffleArray(array: string[]) {
  const newArray = array.slice()
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

seed().then(() => {
  console.log('Database seeded!')
})
