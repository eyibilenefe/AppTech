import * as cheerio from 'cheerio';

export interface Meal {
  mealType: 'Kahvaltı' | 'Akşam Yemeği';
  calories?: string;
  items: string[];
}

// Helper to get today's date in the format "D MMMM YYYY, dddd" (e.g., "14 Haziran 2024, Cuma")
const getTodayDateString = () => {
  const today = new Date();
  // Turkish locale for month and day names
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(today);
};

export const fetchKykMeals = async (): Promise<Meal[]> => {
  try {
    const response = await fetch('https://www.kykmenusu.com/');
    const html = await response.text();
    const $ = cheerio.load(html);

    const nextDataScript = $('#__NEXT_DATA__').html();
    if (!nextDataScript) {
      throw new Error('Could not find __NEXT_DATA__ script tag.');
    }

    const nextData = JSON.parse(nextDataScript);
    const menus = nextData?.props?.pageProps?.menus || [];

    const todayDateString = getTodayDateString().replace(',', ''); // "14 Haziran 2024 Cuma"
    
    const todayMenu = menus.find((menu: any) => menu.date.replace(',', '') === todayDateString);

    if (!todayMenu) {
      return [];
    }

    const parsedMeals: Meal[] = [];

    if (todayMenu.breakfast && todayMenu.breakfast.length > 0) {
      parsedMeals.push({
        mealType: 'Kahvaltı',
        items: todayMenu.breakfast,
        calories: todayMenu.breakfast_calories,
      });
    }

    if (todayMenu.dinner && todayMenu.dinner.length > 0) {
      parsedMeals.push({
        mealType: 'Akşam Yemeği',
        items: todayMenu.dinner,
        calories: todayMenu.dinner_calories,
      });
    }

    return parsedMeals;
  } catch (error) {
    console.error('Error fetching or parsing KYK menu:', error);
    throw error;
  }
}; 