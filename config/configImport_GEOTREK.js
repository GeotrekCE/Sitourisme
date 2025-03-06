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
          trek: true,
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
          trek: true,
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
          trek: true,
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
      1: { // CDRP43
        specialId: 'Haute-Loire CDRP43',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
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
          trek: true,
          event: false
        },
        activity : { // 3 : 3313, 8: 3302
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : { //
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
		    www: '', // Dev https://gtr3demo.ecrins-parcnational.fr/event/
        touristicevent_type : {
          7: 1974, // Distractions et loisirs
        }
      },
      3: { // CAPEV
        specialId: 'Haute-Loire CAPEV',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      4: { // CC Mézenc Loire Meygal
        specialId: 'Haute-Loire CC Mézenc Loire Meygal',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      5: { // CC Cayres Pradelles
        specialId: 'Haute-Loire CC Cayres Pradelles',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      6: { // CC Brioude Sud Auvergne
        specialId: 'Haute-Loire CC Brioude Sud Auvergne',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      7: { // CC des SUCS
        specialId: 'Haute-Loire CC des SUCS',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      8: { // CC Loire Semene
        specialId: 'Haute-Loire CC Loire Semene',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      10: { // CC Marches du Velay Rochebaron
        specialId: 'Haute-Loire CC Marches du Velay Rochebaron',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      43: { // CC Haut Lignon
        specialId: 'Haute-Loire CC Haut Lignon',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      76: { // Auzon Communauté
        specialId: 'Haute-Loire Auzon Communauté',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      109: { // CC Rives du Haut Allier
        specialId: 'Haute-Loire CC Rives du Haut Allier',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
      },
      110: { // CC Haut Pays du Velay
        specialId: 'Haute-Loire CC Haut Pays du Velay',
        name: 'Maison du Tourisme de la Haute-Loire',
        address1: 'Hôtel du Département - 1 place Monseigneur de Galard',
        address2: null,
        city: '16901',
        insee: '43157',
        defaultEmail: 'sport@hauteloire.fr',
        specialIdSitra: '761045',
        statusImport: 2,
        memberId : 1158,
        proprietaireId: 1158,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          6: 4201,
          8: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        }
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
          trek: true,
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
          trek: true,
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
          trek: true,
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
          trek: true,
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
          trek: true,
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
          trek: true,
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
          trek: true,
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
          trek: true,
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
          trek: true,
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
  7 : {
    geotrekUrl : 'https://geotrekadmin.tarn.fr/api/v2',
    structures : {
      1: {
        specialId: 'SITRA2_STR_574511',
        name: 'Tarn Attractivité',
        address1: '10 rue des Grenadiers',
        address2: null,
        city: '33523',
        insee: '81004',
        specialIdSitra: '574511',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      3: {
        specialId: 'SITRA2_STR_827413',
        name: 'Conseil Départemental du Tarn',
        address1: '35 Lices Georges Pompidou',
        address2: null,
        city: '33523',
        insee: '81004',
        specialIdSitra: '827413',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      9: {
        specialId: 'SITRA2_STR_844260',
        name: 'Communauté de Communes Centre Tarn',
        address1: '2 bis Boulevard Carnot',
        address2: null,
        city: '33739',
        insee: '81222',
        specialIdSitra: '844260',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      10: {
        specialId: 'SITRA2_STR_799407',
        name: 'Communauté de Communes Sidobre Vals et Plateaux',
        address1: 'Vialavert',
        address2: null,
        city: '33550',
        insee: '81031',
        specialIdSitra: '799407',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      11: {
        specialId: 'SITRA2_STR_6437334',
        name: 'Communauté de communes du Cordais et du Causse (4C)',
        address1: "33, promenade de l'Autan",
        address2: null,
        city: '33564',
        insee: '81045',
        specialIdSitra: '6437334',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      12: {
        specialId: 'SITRA2_STR_826400',
        name: 'Parc Naturel Régional du Haut Languedoc',
        address1: '1 place du Foirail',
        address2: null,
        city: '13775',
        insee: '34284',
        specialIdSitra: '826400',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      13: {
        specialId: 'SITRA2_STR_6146219',
        name: "Communauté d'Agglomération Gaillac-Graulhet",
        address1: 'Le Nay',
        address2: 'BP 81133',
        city: '33811',
        insee: '81294',
        specialIdSitra: '6146219',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      14: {
        specialId: 'SITRA2_STR_763673',
        name: "Office de Tourisme Vallée du Tarn & Monts de l'Albigeois",
        address1: '149 route de Villefranche',
        address2: null,
        city: '33529',
        insee: '81010',
        specialIdSitra: '763673',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      15: {
        specialId: 'SITRA2_STR_6150073',
        name: 'Office de Tourisme de Castres-Mazamet',
        address1: '2 place de la République',
        address2: null,
        city: '33583',
        insee: '81065',
        specialIdSitra: '6150073',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      16: {
        specialId: 'SITRA2_STR_5303931',
        name: "Communauté d'Agglomération de l'Albigeois",
        address1: 'Parc François Mitterrand',
        address2: null,
        city: '33774',
        insee: '81257',
        specialIdSitra: '5303931',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      17: {
        specialId: 'SITRA2_STR_785720',
        name: 'Office de tourisme intercommunal Tarn-Agout',
        address1: 'rond point de Gabor',
        address2: null,
        city: '33788',
        insee: '81271',
        specialIdSitra: '785720',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      18: {
        specialId: 'SITRA2_STR_777024',
        name: "Office de Tourisme Intercommunal du Lautrécois - Pays d'Agout",
        address1: 'Rue du mercadial',
        address2: null,
        city: '33657',
        insee: '81139',
        specialIdSitra: '777024',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      19: {
        specialId: 'SITRA2_STR_777005',
        name: "Office de tourisme Terres d'Autan - Montagne Noire",
        address1: 'la Serre',
        address2: null,
        city: '33790',
        insee: '81273',
        specialIdSitra: '777005',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      22: {
        specialId: 'SITRA2_STR_811484',
        name: 'Communauté de Communes du Haut-Languedoc',
        address1: "5 Rue de l'Artisanat",
        address2: null,
        city: '33642',
        insee: '81124',
        specialIdSitra: '811484',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      23: {
        specialId: 'SITRA2_STR_802217',
        name: 'Office de tourisme Ségala Tarnais',
        address1: '2 rue du Gaz',
        address2: null,
        city: '33578',
        insee: '81060',
        specialIdSitra: '802217',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      24: {
        specialId: 'SITRA2_STR_4767989',
        name: 'Office de Tourisme Intercommunal Aux sources du canal du Midi',
        address1: 'Place Philippe VI de Valois',
        address2: null,
        city: '12345',
        insee: '31451',
        specialIdSitra: '4767989',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      25: {
        specialId: 'SITRA2_STR_4594085',
        name: "Office de Tourisme d'Albi",
        address1: '42 rue Mariès',
        address2: null,
        city: '33523',
        insee: '81004',
        specialIdSitra: '4594085',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
      26: {
        specialId: 'SITRA2_STR_4934753',
        name: 'Communauté de communes Thoré Montagne Noire',
        address1: '13 avenue de la Ribaute',
        address2: null,
        city: '33524',
        insee: '81005',
        specialIdSitra: '4934753',
        statusImport: 2,
        memberId : 862,
        proprietaireId: 862,
        production: {
          trek: true,
          event: false
        },
        activity : {
          1: 3284,
          2: 3283,
          4: 3333,
          5: 3333,
          6: 4201,
          11: 5446,
          12: 6224,
          13: 3333
        },
        itineraireType : {
          1: 'BOUCLE',
          2: 'ALLER_RETOUR',
          3: 'ALLER_ITINERANCE',
        },
      },
    }
  },
};
