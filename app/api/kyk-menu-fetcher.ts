import * as cheerio from 'cheerio';
import { supabase } from '../../utils/supabase';

export interface Meal {
  mealType: 'Kahvaltı' | 'Akşam Yemeği';
  date?: string;
  items: string[];
}

export interface Review {
  id: string;
  date: string;
  type: 'kyk' | 'university';
  daytime: 'sabah' | 'akşam';
  rating: number;
  comment: string;
  user_id: string;
}

export const fetchReviews = async (
  date: string,
  type: 'kyk' | 'university',
  daytime: 'sabah' | 'akşam'
): Promise<Review[]> => {
  try {
    console.log(`Fetching reviews for: ${date}, ${type}, ${daytime}`);

    const { data, error } = await supabase
      .from('food_reviews')
      .select('*')
      .eq('date', date)
      .eq('type', type)
      .eq('daytime', daytime);

    if (error) {
      throw error;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      type: row.type,
      daytime: row.daytime,
      rating: row.score,
      comment: row.comment,
      user_id: row.user_id,
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const fetchKykMeals = async (city: string): Promise<Meal[]> => {
  try {
    const meals: Meal[] = [];

    for (const mealType of ['Kahvaltı', 'Akşam Yemeği']) {
      const isDinner = mealType === 'Akşam Yemeği';
      const response = await fetch(`https://kykyemek.com/Menu/GetDailyMenu/${city}?city=${city}&mealType=${isDinner}&hidePast=false`);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Today's menu is marked with a specific style. We find it by parsing the style tags.
      let todaysMenuCard: any;
      $('style').each((i, styleEl) => {
        const styleContent = $(styleEl).html();
        // This regex looks for a CSS rule styling an element with an id like #areaAll_13
        // with a specific border color (#F5004F), used to highlight today's menu.
        if (styleContent) {
          const match = styleContent.match(/#areaAll_(\d+)\s*\{[^\}]*?border-color:\s*#F5004F/i);
          if (match && match[1]) {
            const todayId = match[1];
            todaysMenuCard = $(`#areaAll_${todayId}`);
            return false; // Exit $.each loop
          }
        }
      });

      if (todaysMenuCard && todaysMenuCard.length > 0) {
        const card = todaysMenuCard;
        const date = card.find('.card-header .date').text().trim();
        const foodItems = card.find('.card-body > div:first-child p');

        const items: string[] = [];
        foodItems.each((i: number, item: any) => {
          const text = $(item).text().trim();
          if (text) {
            items.push(text);
          }
        });

        if (items.length > 0) {
          meals.push({
            mealType: mealType as 'Kahvaltı' | 'Akşam Yemeği',
            date: date,
            items: items,
          });
        }
      }
    }

    return meals;
  } catch (error) {
    console.error('Error fetching or parsing KYK menu:', error);
    throw error;
  }
}; 