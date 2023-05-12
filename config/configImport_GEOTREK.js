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
  14: 3333
};

exports.itineraireType = {
  1: 'BOUCLE',
  2: 'ALLER_RETOUR',
  3: 'ALLER_ITINERANCE',
  4: 'ALLER_ITINERANCE'
};

exports.url = {
  1: 'https://rando.ecrins-parcnational.fr',
  2: 'https://www.cheminsdesparcs.fr',
  3: 'https://rando.sisteron-buech.fr',
  4: 'http://rando.portcros-parcnational.fr',
  5: 'https://geotrek-admin.alpesrando.net',
  6: 'https://www.rando-alpes-haute-provence.fr',
  7: 'https://rando.marittimemercantour.eu'
};

exports.entity = {
  4433: {
    1: {
      specialId: 'ENT1RandoEcrins',
      name: 'Parc national des Écrins',
      address1: null,
      address2: null,
      city: '1813',
      insee: '05061',
      specialIdSitra: '5411158',
      statusImport: 2
    }
  },
  6696: {
    7: {
      specialId: 'ENT1Poncon',
      name: 'Office de tourisme de Serre-Ponçon',
      address1: null,
      address2: null,
      city: '1927',
      insee: '05179',
      specialIdSitra: '227589',
      statusImport: 2
    }
  },
  6705: {
    5: {
      specialId: 'ENT1PaysEcrin',
      name: 'Office de Tourisme Communautaire du Pays des Écrins',
      address1: null,
      address2: null,
      city: '1761',
      insee: '05006',
      specialIdSitra: '4635720',
      statusImport: 2
    }
  },
  6707: {
    8: {
      specialId: 'ENT1HauteVallée',
      name: "Office de Tourisme des Hautes Vallées - Bureau d'Information Touristique - La Grave",
      address1: null,
      address2: null,
      city: '95462',
      insee: '05320',
      specialIdSitra: '134505',
      statusImport: 2
    },
    9: {
      specialId: 'ENT1HauteVallée',
      name: "Office de Tourisme des Hautes Vallées - Bureau d'Information Touristique - La Grave",
      address1: null,
      address2: null,
      city: '95462',
      insee: '05320',
      specialIdSitra: '134505',
      statusImport: 2
    }
  }
  /*6649: {
    11: {
      specialId: 'ENT1SerreChevalier',
      name: 'Office de Tourisme Serre Chevalier Vallée Briançon',
      address1: null,
      address2: null,
      city: '1909',
      insee: '05240',
      specialIdSitra: '183146',
      statusImport: 2
    }
  }*/
};