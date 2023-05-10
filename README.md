# Sitourisme (PACA-API)

Passerelle permettant d'importer automatiquement des itinéraires depuis l'API d'instances Geotrek-admin vers Apidae (par API).

- Fonctionnement et correspondance des champs : https://geotrek.ecrins-parcnational.fr/ressources/technique/2022-04-Geotrek-Apidae-v2.pdf
- Présentation aux rencontres Geotrek 2021 : https://geotrek.ecrins-parcnational.fr/rencontres/2021/presentations/09-geotrek-apidae.pdf

Afin de mettre en place la passerelle, il est nécessaire :
- de créer un projet d'API en écriture sur la plateforme Apidae en indiquant les prestataires
- de fournir les éléments suivants :
  - URL du flux API Geotrek
  - Numéro du projet créé sur la plateforme Apidae avec envoi des clef et secret Oauth
  - Pour chaque identifiant de structure Geotrek, fournir l'identifiant de l'ENT correspondant dans Apidae 

Version 1 financée par la [Région Sud](https://www.maregionsud.fr), développée par [IDfr](https://www.idfr.net) et [MEDIACTEURS](https://mediacteurs.net).

Depuis 2023, l'[agence WebSenso](https://www.websenso.com) héberge la plateforme qui synchronise quotidiennement Géotrek avec Apidae. 

## Installation

Outils nécessaires :

- NodeJS 15+
- Docker et Docker-compose
- MongoDB 4.4.6

Créer la structure de dossier comme indiqué dans l'arbre elsn dessous :

```
├── Sitourisme (PACA-API)
└── var
    └── data
        └── report
```

Dans le projet effectuer les commandes d'installation : 

```
$ docker-compose up -d
```
2 containers Docker sont ainsi créés, MongoDB & ElasticSearch.

Ensuite pour générer l'application :

```
$ npm install
$ npm run init-import
$ npm run prod
```

## Usage

L'import des données est effectué automatiquement toutes les nuits via la commande : 

```
$ curl "URL/api/products/import?type=geotrek-api"
```
