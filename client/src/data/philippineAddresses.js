// Comprehensive Philippine Geographic Data (Provinces, Cities/Municipalities, Zip Codes, and Sample Key Barangays)
export const PHILIPPINES_REGIONS_PROVINCES = [
  {
    province: 'Metro Manila (NCR)',
    cities: [
      { name: 'Caloocan City (South)', zip: '1400', barangays: ['Barangay 1', 'Barangay 2', 'Grace Park East', 'Grace Park West', 'Morning Breeze', 'Maypajo', 'Poblacion'] },
      { name: 'Caloocan City (North)', zip: '1420', barangays: ['Bagong Silang', 'Camarin', 'Tala', 'Deparo', 'Kaybiga'] },
      { name: 'Las Piñas City', zip: '1740', barangays: ['Almanza Uno', 'Almanza Dos', 'BF International', 'Pamplona Uno', 'Pamplona Dos', 'Pulang Lupa Uno', 'Talon Uno', 'Talon Dos', 'Zapote'] },
      { name: 'Makati City', zip: '1200', barangays: ['Bel-Air', 'Poblacion', 'San Lorenzo', 'Urdaneta', 'Dasmariñas', 'Forbes Park', 'Bangkal', 'Pio del Pilar', 'Palanan', 'Tejeros', 'Guadalupe Nuevo', 'Guadalupe Viejo'] },
      { name: 'Malabon City', zip: '1470', barangays: ['Acacia', 'Baritan', 'Catmon', 'Concepcion', 'Flores', 'Hulong Duhat', 'Ibaba', 'Maysilo', 'Niugan', 'Panghulo', 'San Agustin', 'Tañong', 'Tonsuya', 'Tugatog'] },
      { name: 'Mandaluyong City', zip: '1550', barangays: ['Addition Hills', 'Bagong Silang', 'Barangka Drive', 'Barangka Ilaya', 'Highway Hills', 'Hulo', 'Malamig', 'Namayan', 'Plainview', 'Pleasant Hills', 'Wack-Wack Greenhills'] },
      { name: 'Manila', zip: '1000', barangays: ['Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan', 'Port Area', 'Quiapo', 'Sampaloc', 'San Miguel', 'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Santa Mesa', 'Tondo'] },
      { name: 'Marikina City', zip: '1800', barangays: ['Barangka', 'Calumpang', 'Concepcion Uno', 'Concepcion Dos', 'Fortune', 'Industrial Valley', 'Jesus Dela Peña', 'Malanday', 'Marikina Heights', 'Nangka', 'Parang', 'San Roque', 'Santa Elena', 'Santo Niño', 'Tumana'] },
      { name: 'Muntinlupa City', zip: '1770', barangays: ['Alabang', 'Ayala Alabang', 'Bayanan', 'Buli', 'Cupang', 'Poblacion', 'Putatan', 'Sucat', 'Tunasan'] },
      { name: 'Navotas City', zip: '1485', barangays: ['Bagumbayan North', 'Bagumbayan South', 'Bangculasi', 'Daanghari', 'Navotas East', 'Navotas West', 'North Bay Boulevard', 'San Jose', 'San Roque', 'Tangos', 'Tanza'] },
      { name: 'Parañaque City', zip: '1700', barangays: ['Baclaran', 'BF Homes', 'Don Bosco', 'Don Galo', 'La Huerta', 'Marcelo Green', 'Merville', 'Moonwalk', 'San Antonio', 'San Dionisio', 'San Isidro', 'San Martin de Porres', 'Santo Niño', 'Sun Valley', 'Tambo', 'Vitalez'] },
      { name: 'Pasay City', zip: '1300', barangays: ['Barangay 1', 'Barangay 76 (MOA Area)', 'Barangay 183 (Villamor)', 'Baclaran', 'San Jose', 'San Rafael', 'San Isidro', 'Malibay', 'Maricaban', 'Poblacion'] },
      { name: 'Pasig City', zip: '1600', barangays: ['Bagong Ilog', 'Bambang', 'Caniogan', 'Kapitolyo', 'Malinao', 'Manggahan', 'Maybunga', 'Oranbo', 'Palatiw', 'Pinagbuhatan', 'Pineda', 'Rosario', 'San Antonio', 'San Joaquin', 'San Nicolas', 'Santa Cruz', 'Santa Lucia', 'Santo Tomas', 'Sumilang', 'Ugong'] },
      { name: 'Quezon City', zip: '1100', barangays: ['Alicia', 'Bagong Pag-asa', 'Bahay Toro', 'Batasan Hills', 'Commonwealth', 'Culiat', 'Damayan', 'Diliman (UP Campus)', 'Fairview', 'Holy Spirit', 'Kamuning', 'Katipunan/Loyola Heights', 'Kaunlaran (Cubao)', 'Kristong Hari', 'Matandang Balara', 'New Manila (Mariana)', 'Novaliches Proper', 'Paltok', 'Payatas', 'Phil-Am', 'Project 4', 'Project 6', 'Project 8', 'Sacred Heart', 'San Bartolome', 'San Jose', 'Santa Cruz', 'Santa Mesa Heights (Lourdes)', 'Santo Domingo', 'South Triangle', 'Tandang Sora', 'Teacher\'s Village', 'Ugong Norte', 'Veterans Village', 'West Triangle'] },
      { name: 'San Juan City', zip: '1500', barangays: ['Addition Hills', 'Balong-Bato', 'Batis', 'Corazon de Jesus', 'Greenhills', 'Isabelita', 'Kabayanan', 'Little Baguio', 'Maytunas', 'Onse', 'Pasadeña', 'Progreso', 'Rivera', 'Salapan', 'San Perfecto', 'Santa Lucia', 'Tibagan', 'West Crame'] },
      { name: 'Taguig City (incl. BGC)', zip: '1630', barangays: ['Bagumbayan', 'Bambang', 'Calzada', 'Central Bicutan', 'Fort Bonifacio (BGC)', 'Hagonoy', 'Ibayo-Tipas', 'Katuparan', 'Ligid-Tipas', 'Lower Bicutan', 'Maharlika Village', 'Napindan', 'New Lower Bicutan', 'North Daang Hari', 'North Signal Village', 'Palingon', 'Pinagsama (McKinley)', 'San Miguel', 'Santa Ana', 'South Daang Hari', 'South Signal Village', 'Tanyag', 'Tuktukan', 'Upper Bicutan', 'Ususan', 'Wawa', 'Western Bicutan'] },
      { name: 'Valenzuela City', zip: '1440', barangays: ['Arkong Bato', 'Bagbaguin', 'Balangkas', 'Bignay', 'Canumay East', 'Canumay West', 'Coloong', 'Dalandanan', 'Gen. T. de Leon', 'Isla', 'Karuhatan', 'Lawang Bato', 'Lingunan', 'Mabolo', 'Malanday', 'Malinta', 'Mapulang Lupa', 'Marulas', 'Maysan', 'Palasan', 'Parada', 'Pariancillo Villa', 'Paso de Blas', 'Pasolo', 'Poblacion', 'Polo', 'Punturin', 'Rincon', 'Tagalag', 'Ugong', 'Viente Reales', 'Wawang Pulo'] }
    ]
  },
  {
    province: 'Cavite',
    cities: [
      { name: 'Bacoor City', zip: '4102', barangays: ['Habay', 'Molino I', 'Molino II', 'Molino III', 'Molino IV', 'Niog', 'Panapaan', 'Queens Row', 'San Nicolas', 'Talaba', 'Zapote'] },
      { name: 'Imus City', zip: '4103', barangays: ['Alapan', 'Anabu', 'Bucandala', 'Malagasang', 'Medicion', 'Palico', 'Poblacion', 'Tanzang Luma', 'Toclong'] },
      { name: 'Dasmariñas City', zip: '4114', barangays: ['Burol', 'Fatima', 'Langkaan', 'Paliparan', 'Salawag', 'Salitran', 'Sampaloc', 'San Agustin', 'San Jose', 'Zone 1 (Poblacion)'] },
      { name: 'General Trias City', zip: '4107', barangays: ['Arnaldo', 'Bacao', 'Manggahan', 'Navarro', 'Pasong Camachile', 'San Francisco', 'Santiago', 'Tejero'] },
      { name: 'Tagaytay City', zip: '4120', barangays: ['Asisan', 'Bagong Tubig', 'Caloocan', 'Francisco', 'Iruhin', 'Kaybagal', 'Maharlika', 'Mendez Crossing', 'Neogan', 'Silang Junction', 'Tolentino', 'Sungay'] },
      { name: 'Silang', zip: '4118', barangays: ['Balite', 'Biga', 'Bulihan', 'Hoyo', 'Kaong', 'Lucsuhin', 'Pooc', 'Poblacion', 'Tartaria', 'Tibig'] },
      { name: 'Kawit', zip: '4104', barangays: ['Binakayan', 'Gahak', 'Kaingen', 'Marulas', 'Panamitan', 'Poblacion', 'San Sebastian', 'Tabon', 'Toclong', 'Wakas'] },
      { name: 'Rosario', zip: '4106', barangays: ['Bagbag', 'Kanluran', 'Ligtong', 'Muzon', 'Poblacion', 'Sapa', 'Tejeros Convention', 'Wawa'] },
      { name: 'Carmona', zip: '4116', barangays: ['Cabilang Baybay', 'Kanggahan', 'Lantic', 'Mabuhay', 'Maduya', 'Milagrosa', 'Poblacion'] },
      { name: 'Trece Martires City', zip: '4109', barangays: ['Aguado', 'Cabezas', 'Conchu', 'De Ocampo', 'Gregorio', 'Inocencio', 'Lallana', 'Lapidario', 'Luciano', 'Osorio', 'Perez', 'San Agustin', 'Southville'] }
    ]
  },
  {
    province: 'Laguna',
    cities: [
      { name: 'Santa Rosa City', zip: '4026', barangays: ['Balibago', 'Caingin', 'Dila', 'Dita', 'Don Jose', 'Ibaba', 'Labas', 'Macabling', 'Malitlit', 'Pooc', 'Poblacion', 'Pulong Santa Cruz', 'Santo Domingo', 'Sinalhan', 'Tagapo'] },
      { name: 'Biñan City', zip: '4024', barangays: ['Canlalay', 'Casile', 'De La Paz', 'Ganado', 'Langkiwa', 'Loma', 'Malaban', 'Mamplasan', 'Platero', 'Poblacion', 'San Antonio', 'San Francisco', 'San Vicente', 'Santo Niño', 'Santo Tomas', 'Timbao', 'Tubigan', 'Zapote'] },
      { name: 'Cabuyao City', zip: '4025', barangays: ['Baclaran', 'Banaybanay', 'Banlic', 'Bigaa', 'Butong', 'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland', 'Poblacion', 'Pulo', 'Sala', 'San Isidro'] },
      { name: 'Calamba City', zip: '4027', barangays: ['Barandal', 'Batino', 'Bucal', 'Canlubang', 'Halang', 'La Mesa', 'Laguerta', 'Makiling', 'Milagrosa', 'Palingon', 'Parian', 'Poblacion', 'Real', 'Turbina'] },
      { name: 'San Pedro City', zip: '4023', barangays: ['Bagong Silang', 'Chrysanthemum', 'Cuyab', 'Estrella', 'Fatima', 'G.S.I.S.', 'Landayan', 'Langgam', 'Laram', 'Magsaysay', 'Nueva', 'Pacita 1', 'Pacita 2', 'Poblacion', 'Riverside', 'Rosario', 'San Antonio', 'San Roque', 'San Vicente', 'Santo Niño', 'United Bayanihan', 'United Better Living'] },
      { name: 'Los Baños', zip: '4030', barangays: ['Anos', 'Bagong Silang', 'Bambang', 'Batong Malake', 'Baybayin', 'Bayog', 'Lalakay', 'Maahas', 'Malinta', 'Mayndon', 'Poblacion', 'San Antonio', 'Tadlac', 'Timugan'] },
      { name: 'San Pablo City', zip: '4000', barangays: ['Concepcion', 'Del Remedio', 'San Antonio', 'San Bartolome', 'San Crispin', 'San Cristobal', 'San Francisco', 'San Gabriel', 'San Ignacio', 'San Jose', 'San Lucas', 'San Marcos', 'San Nicolas', 'San Pedro', 'San Rafael', 'San Roque', 'San Vicente', 'Santa Ana', 'Santa Catalina', 'Santa Cruz', 'Santa Elena', 'Santa Filomena', 'Santa Isabel', 'Santa Maria', 'Santa Monica', 'Santa Veronica', 'Santiago', 'Santisimo Rosario', 'Santo Angel', 'Santo Cristo', 'Santo Niño', 'Soledad'] }
    ]
  },
  {
    province: 'Rizal',
    cities: [
      { name: 'Antipolo City', zip: '1870', barangays: ['Bagong Nayon', 'Beverly Hills', 'Calawis', 'Cupang', 'Dalig', 'Dela Paz', 'Inarawan', 'Mambugan', 'Mayamot', 'Muntindilaw', 'San Isidro', 'San Jose', 'San Juan', 'San Luis', 'San Roque', 'Santa Cruz'] },
      { name: 'Cainta', zip: '1900', barangays: ['San Andres', 'San Isidro', 'San Juan', 'San Roque', 'Santa Rosa', 'Santo Domingo', 'Santo Niño'] },
      { name: 'Taytay', zip: '1920', barangays: ['Dolores (Poblacion)', 'Muzon', 'San Isidro', 'San Juan', 'Santa Ana'] },
      { name: 'San Mateo', zip: '1850', barangays: ['Ampid I', 'Ampid II', 'Banaba', 'Dulong Bayan 1', 'Dulong Bayan 2', 'Guinayang', 'Guitnang Bayan 1', 'Guitnang Bayan 2', 'Maly', 'Pintong Bukawe', 'San Kambal', 'San Rafael', 'Santa Ana', 'Silangan'] },
      { name: 'Rodriguez (Montalban)', zip: '1860', barangays: ['Balite', 'Burgos', 'Gerona', 'Kasiglahan', 'Macabud', 'Manggahan', 'Mascap', 'Puray', 'Rosario', 'San Isidro', 'San Jose', 'San Rafael'] },
      { name: 'Angono', zip: '1930', barangays: ['Bagumbayan', 'Kalayaan', 'Mahabang Parang', 'Poblacion Ibaba', 'Poblacion Itaas', 'San Isidro', 'San Pedro', 'San Roque', 'San Vicente', 'Santo Niño'] },
      { name: 'Binangonan', zip: '1940', barangays: ['Bilibiran', 'Calumpang', 'Darangan', 'Layunan', 'Libid', 'Libis', 'Limbon-Limbon', 'Lunsad', 'Mahabang Parang', 'Mambog', 'Pag-asa', 'Palangoy', 'Pantok', 'Pila-pila', 'Tagpos', 'Tatala'] }
    ]
  },
  {
    province: 'Bulacan',
    cities: [
      { name: 'San Jose del Monte City', zip: '3023', barangays: ['Bagong Buhay', 'Citrus', 'Ciudad Real', 'Dulong Bayan', 'Fatima', 'Francisco Homes', 'Gaya-gaya', 'Graceville', 'Kaybanban', 'Kaypian', 'Maharlika', 'Minuyan', 'Muzon', 'Paradise III', 'Poblacion', 'San Manuel', 'San Martin', 'San Pedro', 'San Rafael', 'San Roque', 'Santa Cruz', 'Santo Cristo', 'Santo Niño', 'Sapang Palay', 'Tungkong Mangga'] },
      { name: 'Malolos City', zip: '3000', barangays: ['Balayong', 'Balite', 'Bulihan', 'Caingin', 'Catmon', 'Cofradia', 'Dakila', 'Guinhawa', 'Liang', 'Look 1st', 'Look 2nd', 'Lugam', 'Mabolo', 'Mambog', 'Matimbo', 'Mojon', 'Panasahan', 'Pinagbakahan', 'San Agustin', 'San Gabriel', 'San Juan', 'San Pablo', 'San Vicente', 'Santa Cruz', 'Santa Isabel', 'Santo Cristo', 'Santo Niño', 'Santo Rosario', 'Santor', 'Sumapang Bata', 'Sumapang Matanda', 'Taal', 'Tikay'] },
      { name: 'Meycauayan City', zip: '3020', barangays: ['Bagbaguin', 'Bahay Pare', 'Bancal', 'Banga', 'Bayugo', 'Caingin', 'Calvario', 'Camalig', 'Hulo', 'Iba', 'Langka', 'Lawa', 'Libtong', 'Liputan', 'Malhacan', 'Pajo', 'Pandayan', 'Pantoc', 'Perez', 'Poblacion', 'Saluysoy', 'Tugatog', 'Ubihan', 'Zamora'] },
      { name: 'Marilao', zip: '3019', barangays: ['Abangan Norte', 'Abangan Sur', 'Ibayo', 'Lambakin', 'Lias', 'Loma de Gato', 'Nagbalon', 'Patubig', 'Poblacion I', 'Poblacion II', 'Prenza I', 'Prenza II', 'Santa Rosa I', 'Santa Rosa II', 'Saog', 'Tabing Ilog'] },
      { name: 'Santa Maria', zip: '3022', barangays: ['Bagbaguin', 'Balasing', 'Buenavista', 'Bulac', 'Camangyanan', 'Catmon', 'Cay Pombo', 'Caysio', 'Guyong', 'Lalakhan', 'Mag-asawang Sapa', 'Mahabang Parang', 'Manggahan', 'Parada', 'Poblacion', 'Pulong Buhangin', 'San Gabriel', 'San Jose Patag', 'San Vicente', 'Santa Clara', 'Santa Cruz', 'Silangan', 'Tabing Bakod', 'Tumana'] },
      { name: 'Guiguinto', zip: '3015', barangays: ['Cutcut', 'Daungan', 'Ilang-Ilang', 'Malis', 'Panginay', 'Poblacion', 'Pritil', 'Pulong Gubat', 'Santa Cruz', 'Santa Rita', 'Tabang', 'Tabe', 'Tiaong', 'Tuktukan'] },
      { name: 'Bocaue', zip: '3018', barangays: ['Antipona', 'Bagumbayan', 'Bambang', 'Batia', 'Biñang 1st', 'Biñang 2nd', 'Bolacan', 'Bundukan', 'Bunlo', 'Caingin', 'Duhat', 'Igulot', 'Lolomboy', 'Poblacion', 'Sulucan', 'Taal', 'Tambobong', 'Turo', 'Wakas'] }
    ]
  },
  {
    province: 'Pampanga',
    cities: [
      { name: 'Angeles City', zip: '2009', barangays: ['Balibago', 'Capaya', 'Cutcut', 'Cuayan', 'Malabañas', 'Margot', 'Mining', 'Pampang', 'Pulung Cacutud', 'Pulung Maragul', 'Pulungbulu', 'Salapungan', 'San Jose', 'San Nicolas', 'Santa Teresita', 'Santa Trinidad', 'Santo Cristo', 'Santo Domingo', 'Santo Rosario', 'Sapalibutad', 'Sapangbato', 'Tabun', 'Virgen Delos Remedios'] },
      { name: 'San Fernando City', zip: '2000', barangays: ['Alasas', 'Baliti', 'Bulaon', 'Calulut', 'Del Carmen', 'Del Pilar', 'Del Rosario', 'Dolores', 'Juliana', 'Lara', 'Lourdes', 'Magliman', 'Maimpis', 'Malino', 'Malpitic', 'Pandaras', 'Panipuan', 'Pulung Bulu', 'Quebiawan', 'Saguin', 'San Agustin', 'San Felipe', 'San Isidro', 'San Jose', 'San Juan', 'San Nicolas', 'San Pedro', 'Santa Lucia', 'Santa Teresita', 'Santo Niño', 'Santo Rosario', 'Sindalan', 'Telabastagan'] },
      { name: 'Mabalacat City (Clark)', zip: '2010', barangays: ['Atlu-Bola', 'Bical', 'Bundagul', 'Cacutud', 'Calumpang', 'Camachiles', 'Dapdap', 'Dau', 'Dolores', 'Duquit', 'Lakandula', 'Mabiga', 'Macapagal Village', 'Mamatitang', 'Mangalit', 'Marcos Village', 'Paralayunan', 'Poblacion', 'San Francisco', 'San Joaquin', 'Santa Ines', 'Santa Maria', 'Santo Rosario', 'Sapang Balen', 'Sapang Biabas', 'Tabun'] }
    ]
  },
  {
    province: 'Batangas',
    cities: [
      { name: 'Batangas City', zip: '4200', barangays: ['Alangilan', 'Balagtas', 'Bolbok', 'Calicanto', 'Cuta', 'Gulod Itaas', 'Gulod Labac', 'Kumintang Ibaba', 'Kumintang Ilaya', 'Libjo', 'Pallocan Kanluran', 'Pallocan Silangan', 'Poblacion', 'San Isidro', 'Santa Clara', 'Santa Rita Aplaya', 'Santa Rita Karsada', 'Tabangao Aplaya', 'Wawa'] },
      { name: 'Lipa City', zip: '4217', barangays: ['Antipolo Del Norte', 'Antipolo Del Sur', 'Balintawak', 'Banaybanay', 'Bolbok', 'Bugtong na Pulo', 'Dagatan', 'Inosloban', 'Lodlod', 'Lumbang', 'Mataas na Lupa', 'Marawoy', 'Pangao', 'Pinagkawitan', 'Poblacion', 'Sabang', 'Sampaguita', 'San Carlos', 'San Celestino', 'San Lucas', 'San Salvador', 'San Sebastian', 'Santo Niño', 'Santo Toribio', 'Tambo', 'Tangway', 'Tibulig'] },
      { name: 'Tanauan City', zip: '4232', barangays: ['Altavista', 'Bagbag', 'Bagumbayan', 'Balele', 'Banjo East', 'Banjo West', 'Bilog-bilog', 'Darasa', 'Gonzales', 'Hidalgo', 'Janopol', 'Laurel', 'Luyos', 'Malaking Pulo', 'Maria Paz', 'Natatas', 'Pagaspas', 'Pantay Bata', 'Pantay Matanda', 'Poblacion', 'Sambat', 'San Jose', 'Santor', 'Trapiche', 'Ulango', 'Wawa'] },
      { name: 'Santo Tomas City', zip: '4234', barangays: ['San Antonio', 'San Bartolome', 'San Felix', 'San Fernando', 'San Francisco', 'San Isidro Norte', 'San Isidro Sur', 'San Joaquin', 'San Jose', 'San Juan', 'San Luis', 'San Miguel', 'San Pedro', 'San Rafael', 'San Roque', 'San Vicente', 'Santa Ana', 'Santa Anastacia', 'Santa Clara', 'Santa Cruz', 'Santa Elena', 'Santa Maria', 'Santa Teresita', 'Santiago', 'Poblacion'] }
    ]
  },
  {
    province: 'Cebu',
    cities: [
      { name: 'Cebu City', zip: '6000', barangays: ['Apas (IT Park)', 'Banilad', 'Basak San Nicolas', 'Bulacao', 'Busay', 'Capitol Site', 'Carreta', 'Guadalupe', 'Inayawan', 'Kasambagan', 'Lahug', 'Mabolo', 'Pahina Central', 'Pardo', 'Pari-an', 'Poblacion Pardo', 'Punta Princesa', 'Sambag I', 'Sambag II', 'San Antonio', 'San Jose', 'San Nicolas Proper', 'San Roque', 'Santa Cruz', 'Santo Niño', 'Talamban', 'Tejero', 'Tinago', 'Tisa', 'Zapatera'] },
      { name: 'Mandaue City', zip: '6014', barangays: ['Bakilid', 'Banilad', 'Basak', 'Cabancalan', 'Cambaro', 'Canduman', 'Casili', 'Casuntingan', 'Centro (Poblacion)', 'Guizo', 'Ibabao-Estancia', 'Jagobiao', 'Labogon', 'Looc', 'Maguikay', 'Mantuyong', 'Opao', 'Pakna-an', 'Pagsabungan', 'Subangdaku', 'Tabok', 'Tawason', 'Tingub', 'Tipolo', 'Umapad'] },
      { name: 'Lapu-Lapu City', zip: '6015', barangays: ['Agus', 'Babag', 'Bankal', 'Basak', 'Buaya', 'Calawisan', 'Canjulao', 'Gun-ob', 'Ibo', 'Looc', 'Mactan', 'Maribago', 'Marigondon', 'Pajac', 'Pajo', 'Poblacion', 'Punta Engaño', 'Pusok', 'Subabasbas'] },
      { name: 'Talisay City', zip: '6045', barangays: ['Bulacao', 'Candulawan', 'Cansojong', 'Dumlog', 'Jaclupan', 'Lawaan I', 'Lawaan II', 'Linao', 'Maghaway', 'Manipis', 'Mohon', 'Poblacion', 'Pooc', 'San Isidro', 'San Roque', 'Tabunoc', 'Tangke', 'Tapul'] }
    ]
  },
  {
    province: 'Davao del Sur',
    cities: [
      { name: 'Davao City', zip: '8000', barangays: ['Buhangin', 'Bucana', 'Cabantian', 'Calinan', 'Catalunan Grande', 'Catalunan Pequeño', 'Centro (San Juan)', 'Indangan', 'Mandug', 'Matina Aplaya', 'Matina Crossing', 'Matina Pangi', 'Mintal', 'Poblacion (District 1)', 'Sasa', 'Talomo', 'Tibungco', 'Toril', 'Tugbok'] },
      { name: 'Digos City', zip: '8002', barangays: ['Aplaya', 'Balabag', 'Cogon', 'Colorado', 'Dulangan', 'Goma', 'Igpit', 'Kiagot', 'Lungag', 'Mahayahay', 'Matti', 'Rizal', 'San Agustin', 'San Jose', 'San Miguel', 'San Roque', 'Sinawilan', 'Soong', 'Tiguman', 'Tres De Mayo', 'Zone 1 (Poblacion)', 'Zone 2 (Poblacion)', 'Zone 3 (Poblacion)'] }
    ]
  },
  {
    province: 'Iloilo',
    cities: [
      { name: 'Iloilo City', zip: '5000', barangays: ['City Proper', 'Jaro', 'La Paz', 'Lapuz', 'Mandurriao (Megaworld)', 'Molo', 'Villa Arevalo'] },
      { name: 'Passi City', zip: '5037', barangays: ['Agdahon', 'Bagacay', 'Gines Viejo', 'Man-it', 'Poblacion Ilawod', 'Poblacion Ilaya', 'Salngan'] }
    ]
  },
  {
    province: 'Negros Occidental',
    cities: [
      { name: 'Bacolod City', zip: '6100', barangays: ['Alangilan', 'Alijis', 'Banago', 'Bata', 'Cabug', 'Estefania', 'Felisa', 'Granada', 'Handumanan', 'Mandalagan', 'Mansilingan', 'Montevista', 'Pahanocoy', 'Punta Taytay', 'Singcang-Airport', 'Sum-ag', 'Taculing', 'Tangub', 'Villamonte', 'Vista Alegre', 'Barangay 1 (Poblacion)', 'Barangay 18 (Poblacion)'] }
    ]
  },
  {
    province: 'Misamis Oriental',
    cities: [
      { name: 'Cagayan de Oro City', zip: '9000', barangays: ['Balulang', 'Bulua', 'Camaman-an', 'Carmen', 'Consolacion', 'Gusa', 'Iponan', 'Kauswagan', 'Lapasan', 'Macabalan', 'Macasandig', 'Nazareth', 'Patag', 'Poblacion (Barangays 1-40)', 'Puerto', 'Puntod', 'Tablon', 'Upper Puerto'] }
    ]
  },
  {
    province: 'Benguet',
    cities: [
      { name: 'Baguio City', zip: '2600', barangays: ['Bakakeng Central', 'Bakakeng Norte', 'Camp 7', 'Camp 8', 'Country Club Village', 'Engineers\' Hill', 'General Luna', 'Guadalupe', 'Irisan', 'Kabayanihan', 'Kias', 'Loakan Proper', 'Lourdes Subdivision', 'Magsaysay Private', 'Military Cut-off', 'Pacdal', 'Pinsao Proper', 'Quezon Hill', 'Saint Joseph Village', 'Salud Mitra', 'San Luis Village', 'San Vicente', 'Session Road (Poblacion)', 'Teodora Alonzo', 'Trancoville'] },
      { name: 'La Trinidad', zip: '2601', barangays: ['Alapang', 'Alno', 'Ambiong', 'Bahong', 'Balili', 'Beckel', 'Betag', 'Bineng', 'Cruz', 'Lubas', 'Pico', 'Poblacion', 'Puguis', 'Shilan', 'Tawang', 'Wangal'] }
    ]
  }
];
