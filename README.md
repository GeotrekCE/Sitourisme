# Sitourisme (PACA-API)

Passerelle permettant d'importer automatiquement les données d'instances Geotrek vers le SIT Apidae. Lisez la [présentation aux rencontres Geotrek 2021](https://geotrek.ecrins-parcnational.fr/rencontres/2021/presentations/09-geotrek-apidae.pdf).

## Historique
Initialement financée par la [Région Sud](https://www.maregionsud.fr), dans le cadre du programme Alcotra PITEM Outdoor le développement a été conçu par [IDfr](https://www.idfr.net) et [MEDIACTEURS](https://mediacteurs.net) avec la participation du Parc national des Écrins.
Depuis 2023, le Parc national des Écrins a repris la gestion de la passerelle SITourisme, avec un coup de pouce financier de la Région Sud, pour le compte de la communauté des utilisateurs de Geotrek. Le déploiement de la plateforme est pour l’instant financé par le Parc national des Écrins que en a confié l’hébergement à l'[agence WebSenso](https://www.websenso.com). Elle synchronise quotidiennement plusieurs instances de Geotrek avec Apidae et elle déploie également des évolutions de la passerelle, financés par différents utilisateurs, voir [CHANGELOG.md](CHANGELOG.md).

## Déploiement mutualisé
Le Parc national des Écrins finance annuellement l’hébergement de la plateforme et sa maintenance de base. De son côté, l'[agence WebSenso](https://www.websenso.com) propose une solution clé-en-main pour effectuer la première connexion et synchroniser les données de votre Geotrek-admin vers Apidae. Leur équipe héberge ce script et le coût est mutualisé. Reportez-vous à la documentation PDF disponible sur ce repo.

# Installation de votre serveur
Voici le fonctionnement et la correspondance des champs : <https://geotrek.ecrins-parcnational.fr/ressources/technique/2022-04-Geotrek-Apidae-v2.pdf>

*Correspondance détaillée des données : [MAPPING.md](MAPPING.md)*

Afin de mettre en place la passerelle, il est nécessaire (voir PDF sur le Github) :
- côté Apidae : d'avoir un **projet en écriture**.
- côté Geotrek : de connaître les éléments suivants :
  - URL du flux API Geotrek
  - Pour chaque identifiant de structure Geotrek, fournir l'identifiant de l'ENT correspondant dans Apidae

## Outils nécessaires :

- NodeJS 15+
- Docker et Docker-compose
- MongoDB 4.4.6

Créez la structure de dossier :

```
├── Sitourisme (PACA-API)
└── var
    └── data
        └── report
```

Dans le projet, effectuez les commandes d'installation :

```
$ docker-compose up -d
```
Le container Docker de MongoDB est ainsi créé.

Ensuite, pour générer l'application :

```
$ npm install
```

Environnement de développement, connecté à apidae.cooking sur un projet en écriture / multimembre
```
$ npm run dev
```

Environnement de production, connecté à apidae.com
```
$ npm run prod
```

## Usage
L'import des données est effectué automatiquement toutes les nuits via la commande :
```
$ curl "URL/api/products/import?type=geotrek-api"
```

## To prepare
- Update to Mangoose 7.1.x - Methods no CB allowed > refact to do 
- Fix middleware Passeport on product api, Guest GET allowed
- Remove Swig module - Engine templating refactoring needed
