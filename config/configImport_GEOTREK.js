/* Used by ImportGeneric Server Model Geotrek API*/
exports.types = {
  EQU: 'EQUIPEMENT'
};

exports.activity = {
  0: 3333, // Itinéraire VTT
  1: 3284, // Itinéraire VTT
  2: 3283, // Itinéraire cyclo
  3: 3313, // Itinéraire de randonnée équestre
  4: 3333, // Itinéraire de randonnée pédestre
  5: 5147, // Randonnée palmée
  6: 4201, // Itinéraire de Trail
  7: 3333, // Itinéraire de randonnée pédestre
  8: 4201, // Itinéraire de Trail
  9: 3333, // Itinéraire VTT
  10: 3333, // Itinéraire VTT
  11: 3333, // Itinéraire VTT
};

exports.itineraireType = {
  1: 'BOUCLE',
  2: 'ALLER_RETOUR',
  3: 'ALLER_ITINERANCE',
  4: 'ALLER_ITINERANCE'
};

exports.geotrekInstance = {
  0: {
    geotrekUrl : 'https://geotrek-admin.ecrins-parcnational.fr/api/v2x',
    structures : {
      5: {
        specialId: 'ENT1PaysEcrin',
        name: 'Office de Tourisme Communautaire du Pays des Écrins',
        address1: null,
        address2: null,
        city: '1761',
        insee: '05006',
        specialIdSitra: '4635720',
        statusImport: 2,
        memberId : 6705
      },
      7: {
        specialId: 'ENT1Poncon',
        name: 'Office de tourisme de Serre-Ponçon',
        address1: null,
        address2: null,
        city: '1927',
        insee: '05179',
        specialIdSitra: '227589',
        statusImport: 2,
        memberId : 6696
      },
      8: {
        specialId: 'ENT1HauteVallée',
        name: "Office de Tourisme des Hautes Vallées - Bureau d'Information Touristique - La Grave",
        address1: null,
        address2: null,
        city: '95462',
        insee: '05320',
        specialIdSitra: '134505',
        statusImport: 2,
      },
      9: {
        specialId: 'ENT1HauteVallée',
        name: "Office de Tourisme des Hautes Vallées - Bureau d'Information Touristique - La Grave",
        address1: null,
        address2: null,
        city: '95462',
        insee: '05320',
        specialIdSitra: '134505',
        statusImport: 2,
      }
    }
  },
  1 : {
    geotrekUrl : 'https://geotrek-admin.ecrins-parcnational.fr/api/v2',
    structures : {
      1: {
        specialId: 'ENT1RandoEcrins',
        name: 'Parc national des Écrins',
        address1: null,
        address2: null,
        city: '1813',
        insee: '05061',
        specialIdSitra: '5411158',
        statusImport: 2,
        memberId : 4433
      },
      3568: {
        specialId: 'ENT1RandoEcrins',
        name: 'Parc national des Écrins',
        address1: null,
        address2: null,
        city: '1813',
        insee: '05061',
        specialIdSitra: '1856',
        statusImport: 2,
        memberId : 1856,
        activity : {
          0: 3333, // Itinéraire VTT
          1: 3284, // Itinéraire VTT
          2: 3283, // Itinéraire cyclo
          3: 3313, // Itinéraire de randonnée équestre
          4: 1992, // Itinéraire de randonnée pédestre
          5: 5147, // Randonnée palmée
          6: 4201, // Itinéraire de Trail
          7: 3333, // Itinéraire de randonnée pédestre
          8: 4201, // Itinéraire de Trail
          9: 3333, // Itinéraire VTT
          10: 3333, // Itinéraire VTT
          11: 3333, // Itinéraire VTT
        } 
      },
    }
  }
};
