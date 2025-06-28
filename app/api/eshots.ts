// CSV dosyasındaki başlıklara göre ScheduleItem arayüzü
export interface ScheduleItem {
  HAT_NO: string;
  TARIFE_ID: string;
  GIDIS_SAATI: string;
  DONUS_SAATI: string;
  SIRA: string;
  GIDIS_ENGELLI_DESTEGI: string;
  DONUS_ENGELLI_DESTEGI: string;
  BISIKLETLI_GIDIS: string;
  BISIKLETLI_DONUS: string;
  GIDIS_ELEKTRIKLI_OTOBUS: string;
  DONUS_ELEKTRIKLI_OTOBUS: string;
}

// CSV'yi parse eden yardımcı fonksiyon (noktalı virgül ile ayrılmış, başlık yok)
const parseCSV = (csvText: string): ScheduleItem[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  console.log('Total CSV lines:', lines.length);
  console.log('First few lines:', lines.slice(0, 3));

  // Veri satırlarını işle (başlık satırı yok)
  const data: ScheduleItem[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSV satırını parse et (noktalı virgülle ayrılmış değerler)
    const values = line.split(';').map(value => value.trim());
    
    // En az 11 değer olmalı (tüm alanlar için)
    if (values.length < 11) {
      console.log(`Skipping line ${i}: insufficient values (${values.length})`);
      continue;
    }
    
    // ScheduleItem objesi oluştur
    const item: ScheduleItem = {
      HAT_NO: values[0] || '',
      TARIFE_ID: values[1] || '',
      GIDIS_SAATI: values[2] || '',
      DONUS_SAATI: values[3] || '',
      SIRA: values[4] || '',
      GIDIS_ENGELLI_DESTEGI: values[5] || '',
      DONUS_ENGELLI_DESTEGI: values[6] || '',
      BISIKLETLI_GIDIS: values[7] || '',
      BISIKLETLI_DONUS: values[8] || '',
      GIDIS_ELEKTRIKLI_OTOBUS: values[9] || '',
      DONUS_ELEKTRIKLI_OTOBUS: values[10] || ''
    };
    
    data.push(item);
  }
  
  console.log('Parsed items:', data.length);
  console.log('Sample items:', data.slice(0, 3));
  
  return data;
};

// Otobüs hat saatlerini alan fonksiyon
export const getBusSchedules = async (
  hatNo: string | number,
  dayType: string | number
): Promise<ScheduleItem[]> => {
  try {
    // CSV dosyasını çek
    const response = await fetch(
      'https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hareketsaatleri.csv'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('CSV Text received:', csvText.substring(0, 200) + '...'); // İlk 200 karakteri logla
    
    const allSchedules = parseCSV(csvText);
    console.log('All schedules parsed:', allSchedules.length);
    
    // Hat numarasına göre filtrele
    const filteredByLine = allSchedules.filter(item => 
      item.HAT_NO === hatNo.toString()
    );
    console.log(`Schedules for line ${hatNo}:`, filteredByLine.length);
    console.log('Sample filtered by line:', filteredByLine.slice(0, 3));
    
    // TARIFE_ID dağılımını kontrol et
    const tarifeDistribution = filteredByLine.reduce((acc, item) => {
      acc[item.TARIFE_ID] = (acc[item.TARIFE_ID] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('TARIFE_ID distribution:', tarifeDistribution);
    
    // TARIFE_ID'ye göre gün tipini filtrele
    // TARIFE_ID: 1=haftaiçi, 2=cumartesi, 3=pazar
    const filteredByDay = filteredByLine.filter(item => 
      item.TARIFE_ID === dayType.toString()
    );
    console.log(`Schedules for line ${hatNo}, day type ${dayType}:`, filteredByDay.length);
    console.log('Sample filtered by day:', filteredByDay.slice(0, 3));
    
    return filteredByDay;
    
  } catch (error: any) {
    console.error('CSV fetch error:', error);
    throw new Error(`Veri çekme hatası: ${error.message}`);
  }
};

// Belirli bir hattın tüm seferlerini getiren fonksiyon
export const getBusLineSchedules = async (hatNo: string | number): Promise<ScheduleItem[]> => {
  try {
    const response = await fetch(
      'https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hareketsaatleri.csv'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const allSchedules = parseCSV(csvText);
    
    // Sadece hat numarasına göre filtrele
    return allSchedules.filter(item => 
      item.HAT_NO === hatNo.toString()
    );
    
  } catch (error: any) {
    console.error('CSV fetch error:', error);
    throw new Error(`Veri çekme hatası: ${error.message}`);
  }
};
