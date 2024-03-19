/* Used by ImportGeneric Server Model Geotrek API*/
exports.types = {
  'EQU': 'EQUIPEMENT',
  'F&M': 'FETE_ET_MANIFESTATION'
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
  13: 6224,
  14: 3283
};

exports.itineraireType = {
  1: 'BOUCLE',
  2: 'ALLER_RETOUR',
  3: 'ALLER_ITINERANCE',
  4: 'ALLER_ITINERANCE',
  5: 'ALLER_ITINERANCE',
  6: 'ALLER_ITINERANCE'
};

exports.touristicevent_type = {
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
        production: {
          trek: true,
          event: false
        },
        www: 'https://rando.ecrins-parcnational.fr/trek/',
        touristicevent_type : {
        }
      },
      4: {
        production: {
          trek: false,
          event: false
        },
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
        production: {
          trek: false,
          event: false
        },
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
        production: {
          trek: false,
          event: false
        },
      },
      8: {
        production: {
          trek: false,
          event: false
        },
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
        proprietaireId: 541,
        production: {
          trek: false,
          event: false
        },
      },
      11: {
        production: {
          trek: false,
          event: false
        },
      },
      13: {
        production: {
          trek: false,
          event: false
        },
      }
    }
  },
  1 : {
    geotrekUrl : 'https://admin.sportsnature.hauteloire.fr/api/v2',
    structures : {
      1: {
        production: {
          trek: false,
          event: false
        },
      },
      2: { // CD43
        specialId: 'HauteLoire1',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: null,
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: false,
          event: false
        },
        activity : { // 3 : 3313, 8: 3302
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201
        },
        itineraireType : { //
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
		www: 'https://gtr3demo.ecrins-parcnational.fr/event/',
        touristicevent_type : {
          7: 1974, // Distractions et loisirs
        }
      },
      7: {
        production: {
          trek: false,
          event: false
        },
      },
	  10: {
        production: {
          trek: false,
          event: false
        },
      },
	  110: {
        production: {
          trek: false,
          event: false
        },
      },
    }
  },
  2 : {
    geotrekUrl : 'https://geotrek.nature-haute-savoie.fr/api/v2/',
    structures : {
      1: { // CEN74
        specialId: 'CEN74',
        name: 'Asters - Conservatoire d Espaces Naturels de Haute-Savoie',
        address1: '60 avenue de novel',
        address2: null,
        city: '30597',
        insee: '74010',
        specialIdSitra: '128334',
        statusImport: 2,
        memberId : 710,
        proprietaireId: 710,
        production: {
          trek: false,
          event: false
        },
        activity : {
          4: 3333,
          5: 3302
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
        }
      },
    }
  },
  3 : {
    geotrekUrl : 'https://admin.cheminsdesparcs.fr/api/v2',
    structures : {
      1: {
        production: {
          trek: false,
          event: false
        },
      },
      2: { // PNR_LUBERON
        specialId: 'PNR Luberon',
        name: 'Parc naturel régional du Luberon',
        address1: '60, place Jean-Jaurès',
        address2: 'BP 122',
        city: '34196',
        insee: '84003',
        specialIdSitra: '779392',
        statusImport: 2,
        memberId : 5112,
        proprietaireId: 1222,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          3: 3313,
          4: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE'
        }
      },
      3: {
        production: {
          trek: false,
          event: false
        },
      },
      4: {
        production: {
          trek: false,
          event: false
        },
      },
      5: {
        specialId: 'PNR Verdon',
        name: 'Parc Naturel Régional du Verdon',
        address1: 'Domaine de Valx',
        address2: '',
        city: '1662',
        insee: '04135',
        specialIdSitra: '554533',
        statusImport: 2,
        memberId : 831,
        proprietaireId: 831,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          3: 3313,
          4: 3333,
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE'
        }
      },
      6: {
        specialId: 'PNR Alpilles',
        name: 'Parc naturel régional des Alpilles',
        address1: '2, boulevard Marceau',
        address2: '',
        city: '44511',
        insee: '13100',
        specialIdSitra: '765534',
        statusImport: 2,
        memberId : 5033,
        proprietaireId: 1220,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          3: 3313,
          4: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE'
        }
      },
      7: {
        specialId: 'PNR Baronnies',
        name: 'Parc naturel régional des Baronnies provençales',
        address1: '575 route de Nyons',
        address2: '',
        city: '9731',
        insee: '26288',
        specialIdSitra: '92183',
        statusImport: 2,
        memberId : 5053,
        proprietaireId: 1386,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          3: 3313,
          4: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE'
        }
      },
      8: {
        specialId: 'PNR Prealpes',
        name: 'Parc naturel régional des Préalpes d’Azur',
        address1: '1 avenue François GOBY',
        address2: '',
        city: '2062',
        insee: '06130',
        specialIdSitra: '765535',
        statusImport: 2,
        memberId : 5052,
        proprietaireId: 1380,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          3: 3313,
          4: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE'
        }
      },
      9: {
        production: {
          trek: false,
          event: false
        },
      },
      10: {
        specialId: 'PNR Ventoux',
        name: 'Parc Naturel Régional du Mont-Ventoux',
        address1: '1378 avenue Jean Jaurès',
        address2: '',
        city: '34224',
        insee: '84031',
        specialIdSitra: '5584767',
        statusImport: 2,
        memberId : 2122,
        proprietaireId: 2122,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          3: 3313,
          4: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE'
        }
      }
    }
  },
  4 : {
    geotrekUrl : 'https://geotrek-admin.alpesrando.net/api/v2',
    structures : {
      1: {
        production: {
          trek: false,
          event: false
        },
      },
      2: { // DEP05
        specialId: 'Dep05',
        name: 'Département des Hautes-Alpes',
        address1: null,
        address2: null,
        city: '1813',
        insee: '05061',
        specialIdSitra: '227495',
        statusImport: 2,
        memberId : 708,
        proprietaireId: 708,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3333,
          2: 3284,
          3: 3313,
          5: 3333,
          7: 3302,
          8: 6224,
          9: 3283
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_ITINERANCE',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE',
          5: 'ALLER_RETOUR',
        },
        www: '',
        touristicevent_type : {
          7: 1974, // Distractions et loisirs
        }
      },
      4: {
        production: {
          trek: false,
          event: false
        },
      },
      5: {
        production: {
          trek: false,
          event: false
        },
      },
      6: {
        production: {
          trek: false,
          event: false
        },
      },
      9: {
        production: {
          trek: false,
          event: false
        },
      },
    }
  },
  5 : {
    geotrekUrl : 'https://admin.sisteron-buech.fr/api/v2',
    structures : {
      2: {
        specialId: 'OTSisteronBuech',
        name: 'Office de Tourisme Sisteron Buëch - bureau de Sisteron',
        address1: null,
        address2: null,
        city: '1729',
        insee: '04209',
        specialIdSitra: '735737',
        statusImport: 2,
        memberId : 537,
        proprietaireId: 537,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          3: 3313,
          4: 3333,
          6: 4201,
          7: 3333,
          8: 6224
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE',
        },
      },
    }
  },
  6 : {
    geotrekUrl : 'https://gardpleinenature-admin.gard.fr/api/v2',
    structures : {
      1: {
        specialId: 'Département',
        name: 'Gard Tourisme',
        address1: null,
        address2: null,
        city: '11732',
        insee: '30189',
        specialIdSitra: '5069339',
        statusImport: 2,
        memberId : 2255,
        proprietaireId: 2255,
        production: {
          trek: false,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          8: 4201
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
          4: 'ALLER_ITINERANCE',
        },
      },
      4: {
        production: {
          trek: false,
          event: false
        },
      },
      6: {
        production: {
          trek: false,
          event: false
        },
      },
      7: {
        production: {
          trek: false,
          event: false
        },
      },
      8: {
        production: {
          trek: false,
          event: false
        },
      },
      9: {
        production: {
          trek: false,
          event: false
        },
      },
      14: {
        production: {
          trek: false,
          event: false
        },
      },
      15: {
        production: {
          trek: false,
          event: false
        },
      },
      16: {
        production: {
          trek: false,
          event: false
        },
      },
      18: {
        production: {
          trek: false,
          event: false
        },
      },
    }
  },
  
};
