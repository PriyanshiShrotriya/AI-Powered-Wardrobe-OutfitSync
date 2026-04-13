const TYPE_GROUPS = {
  top: ['shirt', 'tshirt', 't-shirt', 'blouse', 'sweater', 'hoodie', 'jacket'],
  bottom: ['pants', 'jeans', 'shorts', 'skirt', 'trousers'],
  shoes: ['shoes', 'sneakers', 'boots', 'sandals', 'heels'],
};

const WEATHER_TO_SEASONS = {
  hot: ['summer', 'spring'],
  warm: ['summer', 'spring'],
  mild: ['spring', 'fall', 'autumn'],
  cold: ['winter', 'fall', 'autumn'],
  rainy: ['fall', 'autumn', 'spring'],
};

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const findBestItem = (items, typeList) => {
  return items.find((item) => typeList.includes(normalize(item.type)));
};

const getRuleBasedRecommendation = ({ wardrobeItems, weather, occasion }) => {
  const normalizedWeather = normalize(weather);
  const normalizedOccasion = normalize(occasion);
  const expectedSeasons = WEATHER_TO_SEASONS[normalizedWeather] || [];

  const filtered = wardrobeItems.filter((item) => {
    const seasonMatch =
      expectedSeasons.length === 0 || expectedSeasons.includes(normalize(item.season));
    const occasionMatch =
      !normalizedOccasion || normalize(item.occasion) === normalizedOccasion;

    return seasonMatch && occasionMatch;
  });

  const sourceItems = filtered.length > 0 ? filtered : wardrobeItems;

  const top = findBestItem(sourceItems, TYPE_GROUPS.top);
  const bottom = findBestItem(sourceItems, TYPE_GROUPS.bottom);
  const shoes = findBestItem(sourceItems, TYPE_GROUPS.shoes);

  const selected = [top, bottom, shoes].filter(Boolean);

  if (selected.length === 0) {
    return {
      strategy: 'rule-based',
      items: [],
      notes: 'No matching items found. Add more wardrobe items for better suggestions.',
    };
  }

  return {
    strategy: 'rule-based',
    items: selected,
    notes: filtered.length > 0
      ? 'Matched by weather and occasion filters.'
      : 'Used closest available wardrobe items because strict filters returned no match.',
  };
};

module.exports = {
  getRuleBasedRecommendation,
};
