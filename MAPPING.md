# Correspondance des champs "Liste de choix"

## Geotrek:Trek – Apidae:Équipement

| Libellé Geotrek | Nom système | Libellé Apidae | Nom système | Remarques |
|:--|:--|:--|:--|:--|
| Difficulté | `difficulty` | Complément accueil | `prestations.complementAccueil` | Les valeurs Geotrek sont écrites en texte dans Apidae, cf. [https://geotrek.ecrins-parcnational.fr/ressources/technique/2022-04-Geotrek-Apidae-v2.pdf](https://geotrek.ecrins-parcnational.fr/ressources/technique/2022-04-Geotrek-Apidae-v2.pdf) |
| Pratique | `practice` | Types d'activité / d'équipement | `informationsEquipement.activites` | Correspondance définie dans la configuration de la passerelle, pour l'instance/la structure Geotrek souhaitée. Valeurs Apidae : [/config/apidae/equipement_activity.json](https://github.com/GeotrekCE/Sitourisme/blob/main/config/apidae/equipement_activity.json) |
| Parcours | `route` | Type d'itinéraire | `informationsEquipement.itineraire.itineraireType` | Correspondance définie dans la configuration de la passerelle, pour l'instance/la structure Geotrek souhaitée. Valeurs Apidae : **BOUCLE**, **ALLER_RETOUR**, **ALLER_ITINERANCE** |
| Thèmes | `themes` | *Non repris* |  |  |
| Étiquettes | `labels` | *Non repris* |  |  |
| Réseaux | `networks` | Précisions balisage | `informationsEquipement.itineraire.precisionsBalisage` | Les valeurs Geotrek sont écrites en texte dans Apidae, séparées par des tirets. Certaines valeurs sont réécrites : **PR → Balisage Petite Randonée**, **GR → Balisage Grande Randonée**, **GRP → Balisage Grande Randonnée de Pays**, **VTT → Balisage VTT** |
| Lien web | `web_links` | *Non repris* |  |  |
| Lieu de renseignement → Rue | `information_desks` (référence) → `street` | Adresse | `localisation.adresse` | Les coordonnées du lieu de renseignement sont réparties dans plusieurs champs de la fiche Apidae. |
| Lieu de renseignement → Site web | `information_desks` (référence) → `website` | Moyens de communication | `informations.moyensCommunication` | Les coordonnées du lieu de renseignement sont réparties dans plusieurs champs de la fiche Apidae. |
| Lieu de renseignement → Courriel | `information_desks` (référence) → `email` | Moyens de communication | `informations.moyensCommunication` | Les coordonnées du lieu de renseignement sont réparties dans plusieurs champs de la fiche Apidae. |
| Lieu de renseignement → Téléphone | `information_desks` (référence) → `phone` | Moyens de communication | `informations.moyensCommunication` | Les coordonnées du lieu de renseignement sont réparties dans plusieurs champs de la fiche Apidae. |
| Source | `source` | *Non repris* |  |  |
| Portail | `portal` | *Non repris* |  |  |
| Enfant | `children` ? | *Non repris* |  |  |
| Système de réservation | `reservation_system` | *Non repris* |  |  |
| Itinéraires liés | ? | *Non repris* |  |  |
| Type d'accessibilité | `accessibilities` | *Non repris* |  |  |
| Niveau d'accessibilité | `accessibility_level` | *Non repris* |  |  |
| Coordonnées | `departure_geom` | Géolocalisation | `localisation.geolocalisation.geoJson.coordinates` | Les coordonnées Geotrek sont issues du champ departure_geom quand celui-ci est renseigné, sinon du champ parking_location |