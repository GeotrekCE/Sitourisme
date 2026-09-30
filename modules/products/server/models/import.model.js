'use strict';

const path = require('path'),
  _ = require('lodash'),
  pify = require('pify'),
  DataString = require(path.resolve('./library/data/manipulate.js')),
  config = require(path.resolve('./config/config.js')),
  configImportGEOTREK = require(path.resolve('./config/configImport_GEOTREK.js')),
  //configSitraTownByInsee = require(path.resolve('./config/configSitraTownByInsee.js')),
  geotrek = require(path.resolve('./library/import/geotrek.js'));

class importModel extends geotrek
{
  constructor(instanceApi)
  {
    super();
    this.product = null;
    this.instanceApi = instanceApi;
    this.lang = 'fr';
  }
  
  async formatDatas(element, additionalInformation, structure, proprietaireId, importType, configData, user)
  {
    return this.product = {
      importType: importType,
      importSubType: null,
      typeCode: configData.codeType,
      type: configImportGEOTREK.types[configData.codeType],
      specialId: element.id,
      instanceStructureGeotrekId: `${structure}_${element.structure}_${element.id}`,
      geotrekInstanceId: structure,
      geotrekStructureId: element.structure,
      subType: configData.subType,
      member: configData.member,
      state: 'HIDDEN',
      user: user,
      proprietaireId: proprietaireId,
      name: element.name['fr'],
      nameEn: element.name['en'],
      nameEs: element.name['es'],
      nameIt: element.name['it'],
      nameDe: element.name['de'],
      nameNl: element.name['nl'],
      activity: this.getActivity(element, structure),
      typeClient: this.getDifficulty(element, additionalInformation.difficulties),
      ambianceLibelle: this.getAmbianceLibelle(element, 'fr'),
      ambianceLibelleEn: this.getAmbianceLibelle(element, 'en'),
      ambianceLibelleEs: this.getAmbianceLibelle(element, 'es'),
      ambianceLibelleIt: this.getAmbianceLibelle(element, 'it'),
      ambianceLibelleDe: this.getAmbianceLibelle(element, 'de'),
      ambianceLibelleNl: this.getAmbianceLibelle(element, 'nl'),
      passagesDelicats: this.getPassagesDelicats(element, 'fr', additionalInformation.labels),
      passagesDelicatsEn: this.getPassagesDelicats(element, 'en', additionalInformation.labels),
      passagesDelicatsEs: this.getPassagesDelicats(element, 'es', additionalInformation.labels),
      passagesDelicatsIt: this.getPassagesDelicats(element, 'it', additionalInformation.labels),
      passagesDelicatsDe: this.getPassagesDelicats(element, 'de', additionalInformation.labels),
      passagesDelicatsNl: this.getPassagesDelicats(element, 'nl', additionalInformation.labels),
      labelsMapping: this.getLabelsMapping(element, additionalInformation.labels),
      typePromoSitra: this.getTypologieMapping(element, additionalInformation.labels),
      theme: this.getThemesMapping(element, structure),
      complement: this.getComplement(element, 'fr'),
      complementEn: this.getComplement(element, 'en'),
      complementEs: this.getComplement(element, 'es'),
      complementIt: this.getComplement(element, 'it'),
      complementDe: this.getComplement(element, 'de'),
      complementNl: this.getComplement(element, 'nl'),
      localization: this.getLocalization(element),
      price: this.getPrice(element),
      itinerary: await this.getItinerary(element, structure),
      perimetreGeographique: this.getPerimetreGeographique(element),
      description: this.getDescription(element, 'fr'),
      descriptionEn: this.getDescription(element, 'en'),
      descriptionEs: this.getDescription(element, 'es'),
      descriptionIt: this.getDescription(element, 'it'),
      descriptionDe: this.getDescription(element, 'de'),
      descriptionNl: this.getDescription(element, 'nl'),
      shortDescription: this.getShortDescription(element, 'fr'),
      shortDescriptionEn: this.getShortDescription(element, 'en'),
      shortDescriptionEs: this.getShortDescription(element, 'es'),
      shortDescriptionIt: this.getShortDescription(element, 'it'),
      shortDescriptionDe: this.getShortDescription(element, 'de'),
      shortDescriptionNl: this.getShortDescription(element, 'nl'),
      address: this.getAddress(element, additionalInformation),
      website: this.getWebsite(element, additionalInformation),
      email: this.getEmail(additionalInformation, configImportGEOTREK.geotrekInstance[structure].structures[element.structure].defaultEmail),
      phone: this.getPhone(additionalInformation),
      gpx: this.getGpx(element),
      kml: this.getKml(element),
      video: this.getVideo(element, 'fr'),
      videoEn: this.getVideo(element, 'en'),
      videoEs: this.getVideo(element, 'es'),
      videoIt: this.getVideo(element, 'it'),
      videoDe: this.getVideo(element, 'de'),
      videoNl: this.getVideo(element, 'nl'),
      pdf: this.getPdf(element, 'fr'),
      pdfEn: this.getPdf(element, 'en'),
      pdfEs: this.getPdf(element, 'es'),
      pdfIt: this.getPdf(element, 'it'),
      pdfDe: this.getPdf(element, 'de'),
      pdfNl: this.getPdf(element, 'nl'),
      image: this.getImage(element),
      morePdfs : this.getMorePdfs(element),
      /*complementAccueil: 'reset',*/
      complementAccueil: this.getComplementAccueil(element, 'fr', additionalInformation),
      complementAccueilEn: this.getComplementAccueil(element, 'en', additionalInformation),
      complementAccueilEs: this.getComplementAccueil(element, 'es', additionalInformation),
      complementAccueilDe: this.getComplementAccueil(element, 'de', additionalInformation),
      complementAccueilNl: this.getComplementAccueil(element, 'nl', additionalInformation),
      complementAccueilIt: this.getComplementAccueil(element, 'it', additionalInformation),
      animauxAcceptes: this.getAnimaux(element, structure, additionalInformation.labels),
      adaptedTourism: this.getTrekAccessibilities(element, structure, additionalInformation),
      imageAdaptedTourism: this.getTrekAccessImages(element),
    }
  }
  
  getActivity(element, structure) {
    var activity = [];
    if (element.practice) {
      if (configImportGEOTREK.geotrekInstance[structure].activity != undefined &&
        configImportGEOTREK.geotrekInstance[structure].activity[element.practice] != undefined
      ) {
        activity.push(configImportGEOTREK.geotrekInstance[structure].activity[element.practice])
      } else {
        activity.push(configImportGEOTREK.activity[element.practice])
      }
      if (process.env.NODE_ENV != 'production') { 
        activity = activity.map((activityId) => {
          return configImportGEOTREK.activityCooking[activityId] ?? activityId
        })
      }
    }
    return activity
  }

  getDifficulty(element, difficulties) {
    if (element.difficulty && difficulties[element.difficulty]) {
        return difficulties[element.difficulty]
    }
    return null
  }

getAmbianceLibelle(element, lang) {
  let ambianceLibelle = null

  if (element.description && element.description[lang]) {
    let content = element.description[lang]

    content = content.replace(/\n/g, '')
    content = content.replace(/<br\s*\/?>/gi, '\n')
    content = content.replace(/<ol[^>]*>/gi, '\n')
    content = content.replace(/<\/ol>/gi, '\n')

    let index = 0
    content = content.replace(/<li>(.*?)<\/li>/gi, (_, item) => {
      index++
      return `\n${index}. ${item.trim()}`
    })

    content = content.replace(/\n{3,}/g, '\n\n')

    content = DataString.stripTags(
      DataString.strEncode(
        DataString.br2nl(content)
      )
    )
    ambianceLibelle = content.trim()
  }
  return ambianceLibelle
}

  getPassagesDelicats(element, lang, labels) {
    let passagesDelicats = null

    /*if (element.advice && element.advice[lang]) {
      passagesDelicats = DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(element.advice[lang])
        )
      ) + '\r\n\r\n'
    }*/

    if (element.labels && element.labels.length) {
      element.labels.forEach(id => {
        if (labels[id][lang]) {
          if (passagesDelicats === null) passagesDelicats = ''
          passagesDelicats += labels[id][lang] + '\r\n'
        }
      })
    }
    return passagesDelicats
  }

  getLabelsMapping(element, labels) {
    let labelMapping = []
    if (element.labels && element.labels.length) {
      element.labels.forEach(id => {
        if (labels[id]['labelMappingId']) {
         labelMapping.push(labels[id]['labelMappingId'])
        }
      })
    }
    return labelMapping
  }

  getTypologieMapping(element, labels) {
    let typologieMapping = []
    if (element.labels && element.labels.length) {
      element.labels.forEach(id => {
        if (labels[id]['typologieMappingId']) {
         typologieMapping.push(labels[id]['typologieMappingId'])
        }
      })
    }
    return typologieMapping
  }

  getThemesMapping(element, structure) {
    var themes = [];
    if (element.themes && element.themes.length) {
      element.themes.forEach(theme => {
        if (configImportGEOTREK.geotrekInstance[structure].trek_theme != undefined &&
          configImportGEOTREK.geotrekInstance[structure].trek_theme[theme] != undefined
        ) {
          themes.push(configImportGEOTREK.geotrekInstance[structure].trek_theme[theme]);
        } else {
          themes.push(configImportGEOTREK.trek_theme[theme]);
        }
      })
    }
    return themes;
  }

  getComplement(element, lang) {
    let complement = ''

    if (element.departure && element.departure[lang]) {
      complement += `${this.translate('departure', lang)} : ${
        element.departure[lang]
      }.`
    }
    if (element.arrival && element.arrival[lang]) {
      complement += `\n${this.translate('arrival', lang)} : ${
        element.arrival[lang]
      }.`
    }
    if (element.access && element.access[lang]) {
      complement += `\n${this.translate('access', lang)} : ${
        element.access[lang]
      }.`
    }
    if (element.advised_parking && element.advised_parking[lang]) {
      complement += `\n${this.translate('advised_parking', lang)} : ${
        element.advised_parking[lang]
      } .`
    }
    if (element.public_transport && element.public_transport[lang]) {
      complement += `\n${this.translate('public_transport', lang)} : ${
        element.public_transport[lang]
      } .`
    }
    if (complement) {
      complement = DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(complement)
        )
      )
    }
    return complement
  }

  getLocalization(element) {
    const localization = {};
    if (element.departure_geom && element.departure_geom.length) {
      localization.lat = element.departure_geom[1];
      localization.lon = element.departure_geom[0];
    } else if (element.parking_location && element.parking_location.length) {
      localization.lat = element.parking_location[1];
      localization.lon = element.parking_location[0];
    }
    return localization;
  }
  
  async getItinerary(element, structure) {
    const itineraire = {
      dailyDuration: null,
      distance: null,
      positive: null,
      negative: null,
      referencesTopoguides: null,
      referencesCartographiques: null,
      itineraireType: null,
      itineraireBalise: null,
      precisionsBalisage: {}
    }
    if (element.max_elevation) {
      itineraire.altitudeMaximum = element.max_elevation
    }
    if (element.min_elevation) {
      itineraire.altitudeMinimum = element.min_elevation
    }
    if (element.duration) {
      itineraire.dailyDuration = DataString.convertDuration(element.duration)
    }
    if (element.length_2d) {
      itineraire.distance = DataString.convertDistance(element.length_2d)
    }
    if (element.ascent) {
      itineraire.positive = element.ascent
    }
    if (element.descent) {
      itineraire.negative = DataString.convertNegative(element.descent)
    }
    if (element.route) {
      if (configImportGEOTREK.geotrekInstance[structure].itineraireType != undefined)
      {
        itineraire.itineraireType = configImportGEOTREK.geotrekInstance[structure].itineraireType[element.route]
      } else {
        itineraire.itineraireType = configImportGEOTREK.itineraireType[element.route]
      }
    }
    if (element.slug) {
      const slugCategory = this.getSlugCategory(element)
      if (slugCategory) {
        itineraire.referencesTopoguides = this.addUrlHttp(
          `/${slugCategory}/${element.slug}/`
        )
      }
    }
    if (element.networks && element.networks.length) {
      try {
        const trekNetwork = await Promise.all(
          element.networks.map((id) =>
            this.instanceApi.get(`/trek_network/${id}`)
          )
        )

        const labelNetworks = _(trekNetwork).map('data').map('label').valueOf()

        const langs = ['fr', 'en', 'es', 'de', 'nl', 'it']

        const networkMapping = {
          PR: {
            fr: 'Balisage Petite Randonnée',
            en: 'Short hiking trail marking',
            es: 'Señalización de Pequeño Recorrido',
            de: 'Markierung für kurze Wanderwege',
            nl: 'Markering voor korte wandelroute',
            it: 'Segnaletica Piccola Escursione'
          },
          GR: {
            fr: 'Balisage Grande Randonnée',
            en: 'Long-distance hiking trail marking',
            es: 'Señalización de Gran Recorrido',
            de: 'Markierung für Fernwanderwege',
            nl: 'Markering voor langeafstandswandeling',
            it: 'Segnaletica Grande Escursione'
          },
          GRP: {
            fr: 'Balisage Grande Randonnée de Pays',
            en: 'Regional long-distance hiking trail marking',
            es: 'Señalización de Gran Recorrido de País',
            de: 'Markierung für regionale Fernwanderwege',
            nl: 'Markering voor regionale langeafstandswandeling',
            it: 'Segnaletica Grande Escursione di Paese'
          },
          VTT: {
            fr: 'Balisage VTT',
            en: 'Mountain bike trail marking',
            es: 'Señalización BTT',
            de: 'Mountainbike-Beschilderung',
            nl: 'Mountainbikeroute-markering',
            it: 'Segnaletica MTB'
          }
        }

        const getMappingKey = (label) => {
          return langs
            .map((lang) => label?.[lang])
            .filter(Boolean)
            .map((value) => String(value).trim().toUpperCase())
            .find((value) => networkMapping[value])
        }

        const getLabelValue = (label, lang) => {
          const mappingKey = getMappingKey(label)

          if (mappingKey) {
            return networkMapping[mappingKey]?.[lang] || ''
          }

          return label?.[lang] || ''
        }

        itineraire.itineraireBalise = 'BALISE'

        itineraire.precisionsBalisage = langs.reduce((acc, lang) => {
          acc[lang] = labelNetworks
            .map((label) => getLabelValue(label, lang))
            .filter(Boolean)
            .join(' - ')

          return acc
        }, {})
      } catch (err) {
        return itineraire
      }
    }
    return itineraire
  }

  getDescription(element, lang) {
    if (element.ambiance && element.ambiance[lang]) {
      return DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(element.ambiance[lang])
        )
      );
    }
    return ''
  }

  getEmail(additionalElement, defaultEmail) {
    let email = additionalElement.email;
    if (!_.isArray(email)) {
      email = [email];
    }
    if (defaultEmail !== null) {
      email = [defaultEmail];
    }
    return DataString.cleanEmailArray(email);
  }

  getPhone(additionalElement) {
    let phone = additionalElement.phone;
    if (!_.isArray(phone)) {
      phone = [phone];
    }
    return DataString.cleanPhoneArray(phone);
  }

  getGpx(element) {
    if (element.gpx) {
      return [this.addUrlHttp(element.gpx)];
    }
    return [];
  }

  getKml(element) {
    if (element.kml) {
      return [this.addUrlHttp(element.kml)];
    }

    return [];
  }

  getVideo(element, lang) {
    if (element.video && element.video[lang]) {
      let urlVideo = element.video[lang];
      if (urlVideo) {
        urlVideo = [urlVideo];
      }
      return _(urlVideo)
        .map((url) => ({
          url: this.addUrlHttp(url),
          type: 'VIDEO'
        }))
        .valueOf();
    }
    return [];
  }

  getComplementAccueil(element, lang, additionalInformation) {
    const sections = []

    const cleanText = (value) => {
      if (!value) return ''

      const text = typeof value === 'object'
        ? value[lang]
        : value

      if (!text) return ''

      return DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(text)
        )
      ).trim()
    }

    const joinFr = (items) => {
      if (!items.length) return ''
      if (items.length === 1) return items[0]
      return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`
    }

    const getMappedLabel = (mapping, value) => {
      if (!value) return ''

      const id = typeof value === 'object'
        ? value.id
        : value

      if (!id) return ''

      return cleanText(mapping[id])
    }

    const addLine = (lines, label, value) => {
      const text = cleanText(value)
      if (text) {
        lines.push(`${label} : ${text}`)
      }
    }

    /*
    * RECOMMANDATIONS
    */
    if (element.advice && element.advice[lang]) {
      sections.push(
        `>>>> RECOMMANDATIONS\n${cleanText(element.advice)}`
      )
    }

    /*
    * MATERIELS
    */
    if (element.gear && element.gear[lang]) {
      sections.push(
        `>>>> MATERIELS\n${cleanText(element.gear)}`
      )
    }

    /*
    * ACCESSIBILITÉ
    */
    const accessibilityLines = []

    if (element.accessibilities && Array.isArray(element.accessibilities)) {
      const accessibilities = element.accessibilities
        .map(accessibility => getMappedLabel(additionalInformation.trekAccessibilities, accessibility))
        .filter(Boolean)

      if (accessibilities.length) {
        accessibilityLines.push(`Accessible pour : ${joinFr(accessibilities)}`)
      }
    }

    if (element.accessibility_level) {
      const accessibilityLevel = getMappedLabel(
        additionalInformation.trekAccessibilityLevels,
        element.accessibility_level
      )

      if (accessibilityLevel) {
        accessibilityLines.push(`Niveau d'accessibilité : ${accessibilityLevel}`)
      }
    }

    addLine(accessibilityLines, 'Conseils', element.accessibility_advice)
    addLine(accessibilityLines, 'Exposition', element.accessibility_exposure)
    addLine(accessibilityLines, 'Revêtement', element.accessibility_covering)
    addLine(accessibilityLines, 'Pente', element.accessibility_slope)
    addLine(accessibilityLines, 'Largeur', element.accessibility_width)
    addLine(accessibilityLines, 'Signalétique', element.accessibility_signage)
    addLine(accessibilityLines, 'Aménagements', element.disabled_infrastructure)

    if (accessibilityLines.length) {
      sections.push(
        `>>>> ACCESSIBILITÉ\n${accessibilityLines.join('\n')}`
      )
    }

    return sections.join('\n\n')
  }

  getAnimaux(element, structure, labels) {
    const trekAnimaux = configImportGEOTREK.geotrekInstance?.[structure]?.trek_animaux

    if (trekAnimaux === undefined || trekAnimaux === null) {
      return null
    }

    const hasAnimauxLabel = element?.labels?.some(
      id => Number(id) === Number(trekAnimaux)
    )

    return hasAnimauxLabel && labels[trekAnimaux]
      ? 'NON_ACCEPTES'
      : null
    // ACCEPTES
  }

  getTrekAccessibilities(element, structure, additionalInformation) {
    const adaptedTourism = []

    if (Array.isArray(element.accessibilities)) {
      element.accessibilities.forEach((accessibilityId) => {
        const structureMapping =
          configImportGEOTREK.geotrekInstance?.[structure]?.trek_adaptedTourism?.[accessibilityId]

        const defaultMapping =
          configImportGEOTREK.trek_adaptedTourism?.[accessibilityId]

        const adaptedTourismId = structureMapping ?? defaultMapping

        if (adaptedTourismId !== undefined) {
          adaptedTourism.push(adaptedTourismId)
        }
      })
    }

    return adaptedTourism
  }

  getTrekAccessImages(element) {
    if (element.attachments_accessibility) {
        let images = (element.attachments_accessibility)
        .filter((item) => {
          if (item['info_accessibility'] == 'signage')
          {
            return {
              url: this.addUrlHttp(item['url']),
              legend: item['legend'],
              name: item['title'],
              author: item['author']
            }
          }
        })
        images = _(images).valueOf()
      return images
    }
  }  
}

module.exports = importModel