const ORDER_CODE_PREFIX = "JSA";
const RANDOM_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateOrderCode(): string {
  let suffix = "";

  for (let index = 0; index < 5; index += 1) {
    const randomIndex = Math.floor(Math.random() * RANDOM_CHARACTERS.length);
    suffix += RANDOM_CHARACTERS[randomIndex];
  }

  return `${ORDER_CODE_PREFIX}-${suffix}`;
}

export function redirectToWhatsApp(productName: string, size: string): void {
  const orderCode = generateOrderCode();
  const message = `Hey Jersea! ⚡️ I want to grab the ${productName} in size ${size}. My unique order code is: ${orderCode}.`;
  const encodedMessage = encodeURIComponent(message);

  window.location.href = `https://wa.me/917276226240?text=${encodedMessage}`;
}
