function formatCartSummary(cartItems) {
  const items = cartItems.map((item) => {
    const price = Number(item.product.price);
    const lineTotal = price * item.quantity;

    return {
      id: item.id,
      quantity: item.quantity,
      size: item.size,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price,
        imageUrl: item.product.imageUrl,
        stock: item.product.stock
      },
      lineTotal
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal
    }
  };
}

module.exports = { formatCartSummary };
