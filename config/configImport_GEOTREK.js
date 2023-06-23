/* Used by ImportGeneric Server Model Geotrek API*/
exports.types = {
  EQU: 'EQUIPEMENT'
};

exports.activity = {
  2: 3284,
  3: 3313,
  4: 3333,
  7: 3302,
  8: 4201,
  9: 3333,
  11: 3333,
  12: 6225,
  14: 3283
};

exports.itineraireType = {
  1: 'BOUCLE',
  2: 'ALLER_RETOUR',
  3: 'ALLER_ITINERANCE',
  4: 'ALLER_ITINERANCE'
};

exports.geotrekInstance = {
  0: {
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
        memberId : 4433, // to remove not used anymore
        proprietaireId: 707,
        production: true
      },
      5: {
        specialId: 'ENT1PaysEcrin',
        name: 'Office de Tourisme Communautaire du Pays des Écrins',
        address1: null,
        address2: null,
        city: '1761',
        insee: '05006',
        specialIdSitra: '4635720',
        statusImport: 2,
        memberId : 6705,
        proprietaireId: 854,
        production: true
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
        memberId : 6696,
        proprietaireId: 593,
        production: true
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
        memberId : 6707,
        production: false
      }
    }
  },
  /*1 : {
    geotrekUrl : 'https://admin.cheminsdesparcs.fr/api/v2x',
    structures : {
      3568: { // MULTI MEMBER COOKING
        specialId: 'ENT1RandoEcrins',
        name: 'Parc national des Écrins',
        address1: null,
        address2: null,
        city: '1813',
        insee: '05061',
        specialIdSitra: '1856',
        statusImport: 2,
        memberId : 1856,
        production: false,
        activity : {
          0: 3333,
          1: 3284,
          2: 3283,
          3: 3313,
          4: 1992,
          5: 5147,
          6: 4201,
          7: 3333,
          8: 4201,
          9: 3333,
          10: 3333,
          11: 3333,
        } 
      },
    }
  }*/
};
