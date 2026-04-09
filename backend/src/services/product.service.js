const { Op } = require("sequelize");
const { Product } = require("../models");
const { createSlug } = require("../utils/slug");

function buildProductFilters(query) {
  const where = { isActive: true };

  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { category: { [Op.iLike]: `%${query.search}%` } }
    ];
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.featured) {
    where.isFeatured = query.featured === "true";
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price[Op.gte] = Number(query.minPrice);
    if (query.maxPrice) where.price[Op.lte] = Number(query.maxPrice);
  }

  if (query.size) {
    where.sizes = { [Op.contains]: [query.size] };
  }

  return where;
}

function getProductOrder(sort) {
  switch (sort) {
    case "price_asc":
      return [["price", "ASC"]];
    case "price_desc":
      return [["price", "DESC"]];
    case "name_asc":
      return [["name", "ASC"]];
    case "name_desc":
      return [["name", "DESC"]];
    case "newest":
    default:
      return [["createdAt", "DESC"]];
  }
}

async function generateUniqueSlug(name, productId) {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Product.findOne({ where: { slug } });
    if (!existing || existing.id === productId) {
      return slug;
    }
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

module.exports = {
  buildProductFilters,
  getProductOrder,
  generateUniqueSlug
};
