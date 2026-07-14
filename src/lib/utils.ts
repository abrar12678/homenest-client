export function formatPrice(price: number, priceType: string): string {
  const formatted = price.toLocaleString('en-IN');
  if (priceType === 'monthly') {
    return `৳${formatted}/month`;
  }
  return `৳${formatted}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function getStarRating(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push('full');
    } else if (rating >= i - 0.5) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }
  return stars;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Apartment',
    villa: 'Villa',
    commercial: 'Commercial',
    land: 'Land',
  };
  return labels[type] || type;
}

export function getPropertyTypeColor(type: string): string {
  const colors: Record<string, string> = {
    apartment: 'bg-blue-100 text-blue-800',
    villa: 'bg-purple-100 text-purple-800',
    commercial: 'bg-amber-100 text-amber-800',
    land: 'bg-green-100 text-green-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}