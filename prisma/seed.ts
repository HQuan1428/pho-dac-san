import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slug";

const db = new PrismaClient();

// Dev-only accounts. All use the password below.
const DEV_PASSWORD = "Password123!";
const accounts = {
  admin: { email: "admin@phodacsan.local", name: "Quản trị viên", role: "ADMIN" as const },
  seller: { email: "seller@phodacsan.local", name: "Chủ shop Sầm Sơn" },
  seller2: { email: "seller2@phodacsan.local", name: "Chủ shop Tân Cương" },
  staff: { email: "staff@phodacsan.local", name: "Nhân viên shop" },
  customer: { email: "customer@phodacsan.local", name: "Khách hàng mẫu" },
};

// 34 provinces after the 2025 administrative merger.
const regions: Record<string, string[]> = {
  "Miền Bắc": ["Hà Nội", "Hải Phòng", "Cao Bằng", "Điện Biên", "Lai Châu", "Lạng Sơn", "Quảng Ninh", "Sơn La", "Tuyên Quang", "Lào Cai", "Thái Nguyên", "Phú Thọ", "Bắc Ninh", "Hưng Yên", "Ninh Bình"],
  "Miền Trung": ["Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Trị", "Huế", "Đà Nẵng", "Quảng Ngãi", "Gia Lai", "Khánh Hòa", "Lâm Đồng", "Đắk Lắk"],
  "Miền Nam": ["TP. Hồ Chí Minh", "Đồng Nai", "Tây Ninh", "Cần Thơ", "Vĩnh Long", "Đồng Tháp", "Cà Mau", "An Giang"],
};

const categories = ["Đồ khô & hải sản khô", "Trà & cà phê", "Bánh kẹo", "Gia vị & nước chấm", "Gạo & ngũ cốc", "Trái cây & rau củ", "Rượu & đồ uống", "Quà biếu"];

async function main() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const users: Record<string, string> = {};
  for (const [key, a] of Object.entries(accounts)) {
    const u = await db.user.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, passwordHash, emailVerified: new Date(), phone: "0900000000" },
    });
    users[key] = u.id;
  }

  const province: Record<string, string> = {};
  let order = 0;
  for (const [regionName, names] of Object.entries(regions)) {
    const region = await db.region.upsert({
      where: { slug: slugify(regionName) },
      update: {},
      create: { name: regionName, slug: slugify(regionName), sortOrder: order++ },
    });
    for (const name of names) {
      const p = await db.province.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name), regionId: region.id },
      });
      province[name] = p.id;
    }
  }

  const category: Record<string, string> = {};
  for (const [i, name] of categories.entries()) {
    const c = await db.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), sortOrder: i },
    });
    category[name] = c.id;
  }

  const shops = [
    {
      ownerId: users.seller, name: "Nhà Mắm Sầm Sơn", provinceId: province["Thanh Hóa"],
      products: [
        { name: "Mắm tôm Sầm Sơn hũ thủy tinh", cat: "Gia vị & nước chấm", variants: [["Hũ 250g", 45000], ["Hũ 500g", 85000]] },
        { name: "Mực khô Sầm Sơn loại 1", cat: "Đồ khô & hải sản khô", variants: [["250g", 320000], ["500g", 620000]] },
        { name: "Nem chua Thanh Hóa", cat: "Quà biếu", variants: [["Chục 10 cái", 50000], ["Hộp 50 cái", 230000]] },
      ],
    },
    {
      ownerId: users.seller2, name: "Trà Tân Cương Xanh", provinceId: province["Thái Nguyên"],
      products: [
        { name: "Chè Tân Cương đặc biệt", cat: "Trà & cà phê", variants: [["200g", 140000], ["500g", 320000]] },
        { name: "Chè búp Thái Nguyên hộp quà", cat: "Quà biếu", variants: [["Hộp 2 túi", 450000]] },
      ],
    },
  ];

  for (const s of shops) {
    const shop = await db.shop.upsert({
      where: { slug: slugify(s.name) },
      update: {},
      create: {
        ownerId: s.ownerId, name: s.name, slug: slugify(s.name), provinceId: s.provinceId,
        phone: "0912345678", status: "ACTIVE", description: `Đặc sản chính gốc từ ${s.name}.`,
      },
    });
    for (const p of s.products) {
      const slug = slugify(p.name);
      const exists = await db.product.findUnique({ where: { shopId_slug: { shopId: shop.id, slug } } });
      if (exists) continue;
      await db.product.create({
        data: {
          shopId: shop.id, categoryId: category[p.cat], provinceId: s.provinceId, name: p.name, slug,
          description: `${p.name} — đặc sản chính gốc, đóng gói cẩn thận.`, status: "ACTIVE", images: [],
          variants: { create: p.variants.map(([name, price], i) => ({ name: name as string, price: price as number, stock: 100, sortOrder: i })) },
        },
      });
    }
  }

  const firstShop = await db.shop.findUniqueOrThrow({ where: { slug: slugify("Nhà Mắm Sầm Sơn") } });
  await db.shopMember.upsert({
    where: { shopId_userId: { shopId: firstShop.id, userId: users.staff } },
    update: {},
    create: { shopId: firstShop.id, userId: users.staff },
  });

  await db.shop.upsert({
    where: { slug: "dac-san-cho-duyet" },
    update: {},
    create: {
      ownerId: users.customer, name: "Đặc Sản Chờ Duyệt", slug: "dac-san-cho-duyet",
      provinceId: province["Huế"], phone: "0987654321", status: "PENDING",
    },
  });

  console.log(`Seeded. Dev accounts (password "${DEV_PASSWORD}"):`, Object.values(accounts).map((a) => a.email).join(", "));
}

main().finally(() => db.$disconnect());
