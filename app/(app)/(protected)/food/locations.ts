export interface CampusLocation {
    id: string;
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    description: string;
}
  
export const defaultCampusLocations: CampusLocation[] = [
    {
      id: 'default-1',
      name: 'Kütüphane',
      coordinates: { latitude: 38.3121, longitude: 27.1453 },
      description: 'Ana kütüphane önü',
    },
    {
      id: 'default-2',
      name: 'Erkek KYK',
      coordinates: { latitude: 38.3140, longitude: 27.1465 },
      description: 'Erkek öğrenci yurdu',
    },
    {
      id: 'default-3',
      name: 'Kız KYK (Villa)',
      coordinates: { latitude: 38.3162, longitude: 27.1449 },
      description: 'Kız yurdu - villa tarafı',
    },
    {
      id: 'default-4',
      name: 'Kız KYK (Yeni)',
      coordinates: { latitude: 38.3178, longitude: 27.1473 },
      description: 'Kız yurdu - yeni bina',
    },
    {
      id: 'default-5',
      name: 'İnşaat Mühendisliği',
      coordinates: { latitude: 38.3102, longitude: 27.1421 },
      description: 'İnşaat fakültesi önü',
    },
    {
      id: 'default-6',
      name: 'Mimarlık',
      coordinates: { latitude: 38.3115, longitude: 27.1436 },
      description: 'Mimarlık fakültesi girişi',
    },
    {
      id: 'default-7',
      name: 'Moleküler Biyoloji',
      coordinates: { latitude: 38.3129, longitude: 27.1418 },
      description: 'MBG fakültesi ana girişi',
    },
]; 