export const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const getWristCategory = (wristCircumferenceCm) => {
  if (wristCircumferenceCm < 15) return { label: 'Petite / XS', size: 14 };
  if (wristCircumferenceCm < 16.5) return { label: 'Small / Standard Women', size: 16 };
  if (wristCircumferenceCm < 18.5) return { label: 'Medium / Standard Men', size: 18 };
  return { label: 'Large / Relaxed Fit', size: 20 };
};
