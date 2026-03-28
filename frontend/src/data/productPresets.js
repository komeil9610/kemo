export const zamilAcPresets = [
  {
    name: 'مكيف شباك الزامل 18000 وحدة مع تركيب',
    description: 'مكيف شباك من الزامل مناسب للغرف والملاحق، يشمل خدمة التركيب الأساسية وزيارة فنية للتأكد من الجاهزية.',
    category: 'device',
    city: 'الرياض',
    pricePerDay: 95,
    quantity: 6,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'مكيف شباك الزامل 18000 وحدة بدون تركيب',
    description: 'نفس مكيف الزامل بحالة ممتازة للتأجير اليومي أو الأسبوعي بدون خدمة تركيب، مناسب لمن لديه فني خاص أو تركيب جاهز.',
    category: 'device',
    city: 'الرياض',
    pricePerDay: 75,
    quantity: 8,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'مكيف سبليت الزامل 24000 وحدة مع تركيب',
    description: 'مكيف سبليت الزامل بقدرة تبريد عالية للمجالس والغرف الكبيرة، شامل فكرتون وتركيب وتشغيل أولي.',
    category: 'device',
    city: 'الرياض',
    pricePerDay: 140,
    quantity: 4,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'مكيف سبليت الزامل 24000 وحدة بدون تركيب',
    description: 'مكيف سبليت الزامل جاهز للتوريد فقط بدون خدمة تركيب، مناسب للمشاريع أو العملاء الذين يديرون التركيب داخليًا.',
    category: 'device',
    city: 'الرياض',
    pricePerDay: 115,
    quantity: 5,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
  },
];

export function mapPresetProduct(product, index) {
  const quantity = Number(product.quantity ?? 0);

  return {
    _id: String(product._id || `preset-zamil-${index + 1}`),
    ...product,
    quantity,
    availableQuantity: quantity,
    isAvailable: quantity > 0,
    availabilityLabel: quantity > 0 ? 'متوفر' : 'غير متوفر',
    images: [{ url: product.imageUrl }],
  };
}
