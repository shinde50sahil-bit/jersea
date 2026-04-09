const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const { connectDatabase } = require("./config/database");
const { sequelize, Product } = require("./models");
const { generateUniqueSlug } = require("./services/product.service");

const sizeAliases = {
  XS: "S",
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
  "X-LARGE": "XL",
  XXL: "XXL",
  "2XL": "XXL",
  "2X": "XXL",
  XXXL: "3XL",
  "3XL": "3XL",
  "3X": "3XL",
  XXXXL: "4XL",
  "4XL": "4XL",
  "4X": "4XL"
};
const allowedSizes = new Set([
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28"
]);
const genericCollectionNames = new Set([
  "NRL",
  "NBA",
  "NFL-NHL",
  "AFL",
  "GAA",
  "F1",
  "Brasileiro Série A",
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "LIGUE 1",
  "Primeira Liga",
  "Chilean League",
  "Scottish League",
  "MLS",
  "SAF",
  "EREDIVISIE",
  "LIGA MX",
  "Long-Sleeve shirt",
  "kids kit shirt",
  "Retro shirt",
  "Windbreaker/Training Top",
  "Player version",
  "Woman shirt",
  "Training suit kit",
  "shorts",
  "POLO shirt",
  "Baby jersey",
  "sports socks",
  "football boots logo",
  "sports shoes",
  "panties"
]);

function parseMoney(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/[^0-9.]+/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(html) {
  return decodeHtml(
    String(html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<li>/gi, "- ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function compactText(value, maxLength) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function uniqueStrings(values) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function normalizeSize(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return sizeAliases[normalized] || normalized;
}

function normalizeCategory(item) {
  const explicitCategory = String(item.category || "").trim();
  if (explicitCategory) {
    return explicitCategory;
  }

  const tags = Array.isArray(item.tags)
    ? item.tags.map((tag) => String(tag).toLowerCase())
    : [];

  if (tags.some((tag) => tag.includes("football") || tag.includes("soccer"))) {
    return "Football";
  }

  if (
    tags.some(
      (tag) =>
        tag === "f1" || tag.includes("formula") || tag.includes("motorsport")
    )
  ) {
    return "F1";
  }

  if (tags.some((tag) => tag.includes("cricket"))) {
    return "Cricket";
  }

  const rawType = String(item.product_type || "Jersey").trim();
  if (!rawType) {
    return "Jersey";
  }

  return rawType.charAt(0).toUpperCase() + rawType.slice(1);
}

function extractSizes(item) {
  const declaredSizes = Array.isArray(item.sizes) ? item.sizes : [];
  const normalizedDeclaredSizes = uniqueStrings(
    declaredSizes
      .map(normalizeSize)
      .filter((value) => allowedSizes.has(value))
  );

  if (normalizedDeclaredSizes.length > 0) {
    return normalizedDeclaredSizes;
  }

  const variants = Array.isArray(item.variants) ? item.variants : [];
  const variantSizes = variants
    .filter((variant) => variant && variant.available)
    .map((variant) => variant.option1 || variant.title)
    .map(normalizeSize)
    .filter((value) => allowedSizes.has(value));

  if (variantSizes.length > 0) {
    return uniqueStrings(variantSizes);
  }

  const optionValues = Array.isArray(item.options)
    ? item.options.flatMap((option) => option?.values || [])
    : [];

  return uniqueStrings(
    optionValues
      .map(normalizeSize)
      .filter((value) => allowedSizes.has(value))
  );
}

function extractImages(item) {
  const galleryCandidates = Array.isArray(item.images)
    ? item.images.flatMap((image) => {
        if (typeof image === "string") {
          return image;
        }

        if (image && typeof image === "object") {
          return [image.url, image.src];
        }

        return [];
      })
    : [];
  const thumbnail = item.thumbnail || item.featured_image;
  const allImages = uniqueStrings([thumbnail, ...galleryCandidates]);
  const [imageUrl = "", ...gallery] = allImages;

  return {
    imageUrl,
    gallery
  };
}

function extractCompareAtPrice(item) {
  const directCompareAtPrice =
    parseMoney(item.original_price) || parseMoney(item.compare_at_price);

  if (directCompareAtPrice) {
    return directCompareAtPrice;
  }

  const variants = Array.isArray(item.variants) ? item.variants : [];
  const values = variants
    .map((variant) => parseMoney(variant?.compare_at_price))
    .filter((value) => typeof value === "number");

  if (values.length === 0) {
    return null;
  }

  return Math.max(...values);
}

function buildSku(item) {
  if (item.sku) {
    return String(item.sku).trim() || null;
  }

  const variants = Array.isArray(item.variants) ? item.variants : [];
  const skuValues = uniqueStrings(
    variants.map((variant) => String(variant?.sku || "").trim())
  );

  if (skuValues.length === 1) {
    return skuValues[0];
  }

  if (skuValues.length > 1) {
    const base = skuValues[0].replace(/-[A-Z0-9]+$/i, "");
    if (base) {
      return base;
    }

    return skuValues[0];
  }

  if (item.album_id) {
    return `ALBUM-${String(item.album_id).trim()}`;
  }

  const fallback = String(item.handle || item.name || item.title || "JERSEA")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return fallback || null;
}

function estimateStock(item, sizes) {
  if (typeof item.in_stock === "boolean") {
    return item.in_stock ? Math.max(sizes.length, 1) : 0;
  }

  const variants = Array.isArray(item.variants) ? item.variants : [];
  const availableVariants = variants.filter((variant) => variant && variant.available);

  if (availableVariants.length > 0) {
    return availableVariants.length;
  }

  if (variants.length > 0) {
    return 0;
  }

  if (sizes.length > 0) {
    return sizes.length;
  }

  return 0;
}

function buildDescription(item, textDescription, sizes) {
  const detailLines = [];

  if (item.league) {
    detailLines.push(`League: ${item.league}`);
  }

  if (item.variant) {
    detailLines.push(`Variant: ${item.variant}`);
  }

  if (item.vendor) {
    detailLines.push(`Vendor: ${item.vendor}`);
  }

  if (Array.isArray(item.features) && item.features.length > 0) {
    detailLines.push(`Features: ${item.features.join(", ")}`);
  }

  if (Array.isArray(item.tags) && item.tags.length > 0) {
    detailLines.push(`Tags: ${item.tags.join(", ")}`);
  }

  if (item.product_url) {
    detailLines.push(`Source URL: ${item.product_url}`);
  }

  if (item.published_at) {
    detailLines.push(`Published at: ${item.published_at}`);
  }

  if (sizes.length > 0) {
    detailLines.push(`Available sizes: ${sizes.join(", ")}`);
  }

  if (detailLines.length === 0) {
    return textDescription;
  }

  return [textDescription, detailLines.join("\n")].filter(Boolean).join("\n\n");
}

function shouldSkipItem(item, title) {
  if (genericCollectionNames.has(title)) {
    return true;
  }

  if (
    title.length <= 4 &&
    (!item.league || title.toLowerCase() === String(item.league).trim().toLowerCase())
  ) {
    return true;
  }

  return false;
}

function transformScrapedProduct(item) {
  const title = String(item.name || item.title || "").trim();
  if (!title) {
    throw new Error("Each scraped product must include a name or title");
  }

  if (shouldSkipItem(item, title)) {
    return null;
  }

  const sizes = extractSizes(item);
  const safeSizes = sizes.length > 0 ? sizes : ["M"];
  const { imageUrl, gallery } = extractImages(item);
  const textDescription = stripHtml(item.description || item.description_html);
  const description =
    buildDescription(item, textDescription, safeSizes) ||
    `${title} imported from scraped catalog data.`;
  const shortDescription = compactText(
    textDescription || `${title} imported from scraped catalog data.`,
    180
  );
  const price =
    parseMoney(item.price) ||
    parseMoney(item.price_min) ||
    parseMoney(item.price_max) ||
    parseMoney(item.price_display) ||
    parseMoney(item.variants?.[0]?.price_raw) ||
    parseMoney(item.variants?.[0]?.price);

  if (!price) {
    throw new Error(`Missing usable price for "${title}"`);
  }

  if (!imageUrl) {
    throw new Error(`Missing usable image for "${title}"`);
  }

  return {
    slug: String(item.handle || "").trim() || null,
    name: title,
    shortDescription,
    description,
    category: normalizeCategory(item),
    price,
    compareAtPrice: extractCompareAtPrice(item),
    imageUrl,
    gallery,
    sizes: safeSizes,
    stock: estimateStock(item, safeSizes),
    sku: buildSku(item),
    isFeatured: Array.isArray(item.tags)
      ? item.tags.some((tag) => String(tag).toLowerCase().includes("home-kit"))
      : false
  };
}

async function resolveSlug(preferredSlug, name, existingProductId) {
  if (!preferredSlug) {
    return generateUniqueSlug(name, existingProductId);
  }

  const slug = preferredSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    return generateUniqueSlug(name, existingProductId);
  }

  const existing = await Product.findOne({ where: { slug } });
  if (!existing || existing.id === existingProductId) {
    return slug;
  }

  return generateUniqueSlug(name, existingProductId);
}

async function importScrapedProducts(inputPath) {
  const resolvedPath = path.resolve(inputPath);
  const rawFile = await fs.readFile(resolvedPath, "utf8");
  const scrapedProducts = JSON.parse(rawFile);

  if (!Array.isArray(scrapedProducts)) {
    throw new Error("Scraped input file must contain a JSON array");
  }

  await connectDatabase();
  await sequelize.sync();

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const rawItem of scrapedProducts) {
    const product = transformScrapedProduct(rawItem);
    if (!product) {
      skippedCount += 1;
      console.log(`Skipped: ${String(rawItem.name || rawItem.title || "Unnamed item").trim()}`);
      continue;
    }
    const orConditions = [
      { name: product.name }
    ];

    if (product.slug) {
      orConditions.push({ slug: product.slug });
    }

    if (product.sku) {
      orConditions.push({ sku: product.sku });
    }

    const existing = await Product.findOne({
      where: {
        [Op.or]: orConditions
      }
    });

    const slug = await resolveSlug(product.slug, product.name, existing?.id);
    const payload = {
      ...product,
      slug
    };

    if (existing) {
      await existing.update(payload);
      updatedCount += 1;
      console.log(`Updated: ${product.name}`);
      continue;
    }

    await Product.create(payload);
    createdCount += 1;
    console.log(`Created: ${product.name}`);
  }

  console.log(
    `Import completed. Created ${createdCount} product(s), updated ${updatedCount} product(s), skipped ${skippedCount} item(s).`
  );
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error(
      "Please provide the path to the scraped JSON file, for example: npm run import:scraped -- E:\\jerseys_sample_output.json"
    );
  }

  await importScrapedProducts(inputPath);
  await sequelize.close();
}

main().catch(async (error) => {
  console.error("Import failed:", error.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
