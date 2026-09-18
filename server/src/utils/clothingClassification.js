const SHOE_TYPE_HINTS = ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'loafer', 'slipper'];

const normalizeClothingType = (value) => (value || '').toString().trim().toLowerCase();

const isShoeType = (type) => {
  const normalizedType = normalizeClothingType(type);
  return SHOE_TYPE_HINTS.some((hint) => normalizedType.includes(hint));
};

const getClothingGroup = (item) => {
  const category = normalizeClothingType(item?.category);

  if (isShoeType(item?.type)) {
    return 'shoes';
  }

  if (category === 'upperwear') {
    return 'top';
  }

  if (category === 'bottomwear') {
    return 'bottom';
  }

  return null;
};

module.exports = {
  SHOE_TYPE_HINTS,
  normalizeClothingType,
  isShoeType,
  getClothingGroup,
};
