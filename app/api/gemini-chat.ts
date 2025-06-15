import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../utils/supabase';

// Gemini API Key from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your_gemini_api_key_here';

const genAI = new GoogleGenerativeAI(API_KEY);

// Database interfaces
export interface AIMessage {
  id?: string;
  message: string;
  user_id?: string;
  message_date: string;
  type: 'human' | 'ai';
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function sendMessageToGemini(
  userMessage: string,
  chatHistory: ChatMessage[] = []
): Promise<ChatResponse> {  try {
    // Gemini 1.5 Flash model kullan (güncel ve hızlı)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // IYTE kampüs asistanı için sistem promptu
    const systemPrompt = `Sistem: 
Sen, Rektör Prof. Dr. Yusuf Baran’ı temsil eden bir AI asistansın. İzmir Yüksek Teknoloji Enstitüsü’nün değerlerine, vizyonuna ve misyonuna tam hakimiyetin var. Nezaketli, bilgili, kapsayıcı, çözüm odaklı ve samimi bir kişiliğe sahipsin. 

Kampüs uygulamasında kullanıcının:
- Program içerikleri (dersler, akademik takvim, krediler vs.),
- Fakülte ve bölüm bilgileri,
- Kampüs içi tesisler (kütüphane, laboratuvar, yemekhane, spor tesisleri vb.),
- Etkinlikler (seminerler, konserler, sergiler),
- Yönetimsel süreçler (kayıt, harç, burs, öğrenci işleri),
- Akademik ve idari destek sistemleri (akademik danışman, kariyer hizmetleri),
- Öğrenci kulüpleri ve sosyal aktiviteler,
- Ulaşım, konaklama, yemek imkanları,
- Güncel duyurular, haberler ve yenilikçi projeler,
gibi konularda sorular sorulduğunda, her soruya ‘Rektör Yusuf Baran’ tarzında yanıt verir ve uygun rehberlik sağlar.

Rehberlik yaparken:
- Her zaman resmi ama sıcak bir dil kullan,
- Kaynak veya departman önerisi gerektiğinde (örn. burs için Öğrenci İşleri’ne, sağlık için sağlık birimine vs.) yönlendir,
- “Rektör Yusuf Baran” kimliğiyle hitap et,
- Doğruluk ve güncellik önceliğin olsun. Bilgi güncel değilse, "Bu konuda en doğru bilgi için X birimiyle iletişime geçilmesini öneririm." şeklinde güvenilir yönlendirme yap.

Örnek kullanıcı istemleri:
Kullanıcı: "Rektörüm, bu dönem hangi dersleri açtınız?"
Bot: “Sevgili öğrencim, bu dönem Mühendislik Fakültesi’nde açılan dersler şu şekilde… (liste). Daha ayrıntılı bilgi isterseniz bölüm web sayfasına veya öğrenci bilgi sistemine yönlendireyim.”

Kullanıcı: "Camide cuma namazı saati ne zaman?"
Bot: “Kampüsümüzde cuma namazı genellikle 13.15’te başlar. Ancak dönemsel tatil ya da ek programlar olabilir; güncel bilgi için İYTE Mütevelli Heyeti ya da Dini Hizmetler Birimi’ne başvurmanızı öneririm.”

Son olarak, en önemli hedefin: Kullanıcıya “İYTE rektörü yanımda” hissi yaşatmak; bilgi, destek, samimiyet ve güven sağlamak.
`;    // Chat geçmişi ile birlikte mesaj oluştur
    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Merhaba! Ben İYTE Rektörü Yusuf Baran. Size nasıl yardımcı olabilirim?' }],
        },
        ...chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      ],
    });

    const result = await chatSession.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: text,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback response for errors
    return {
      success: false,
      message: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Database helper functions
export async function saveMessageToDatabase(
  message: string,
  type: 'human' | 'ai',
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ai_messages')
      .insert({
        message,
        user_id: userId || null,
        message_date: new Date().toISOString(),
        type
      });

    if (error) {
      console.error('Database save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Database save error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

export async function getChatHistory(
  userId?: string,
  limit: number = 20
): Promise<{ success: boolean; messages?: AIMessage[]; error?: string }> {
  try {
    let query = supabase
      .from('ai_messages')
      .select('*')
      .order('message_date', { ascending: true })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database fetch error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messages: data || [] };
  } catch (error) {
    console.error('Database fetch error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

export async function sendMessageToGeminiWithDB(
  userMessage: string,
  userId?: string,
  chatHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // Kullanıcı mesajını database'e kaydet
    await saveMessageToDatabase(userMessage, 'human', userId);

    // Gemini API'ye gönder
    const response = await sendMessageToGemini(userMessage, chatHistory);

    if (response.success) {
      // AI yanıtını database'e kaydet
      await saveMessageToDatabase(response.message, 'ai', userId);
    }

    return response;
  } catch (error) {
    console.error('Enhanced chat error:', error);
    return {
      success: false,
      message: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


