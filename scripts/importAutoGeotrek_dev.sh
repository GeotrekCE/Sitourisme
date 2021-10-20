#!/bin/bash

#Add Langage here :) - LS
echo "##########################################"
echo "##########################################"
date
lang="fr en it de es nl";
scriptLocation="/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/";

echo "Get Geotrek files for "$lang;

#Get datetrek
echo "_______________________________";

curl --user agent:agent "http://87.98.145.147/api/v2/trek/?page_size=1000&fields=id%2Cupdate_datetime%2Ccreate_datetime&published=true" > "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp"
if [[ ! -f "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek" ]]
	then
	if [[ -f "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp" ]]
		then
		echo "no randoEcrins_datetrek, new tmp randoEcrins_datetrek, import";
		mv /srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp /srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek
	else
		echo "no randoEcrins_datetrek, no tmp randoEcrins_datetrek, abort";
		exit
	fi
else
	if [[ -f "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp" ]]
                then
		echo "compare"
		if ! cmp -s /srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp /srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek
			then
			echo "files differents, import"
			mv /srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp /srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek
		else
			echo "randoEcrins_datetrek and tmp randoEcrins_datetrek files are equals, abort"
			rm /srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp
			exit
		fi
	else
		"no tmp randoEcrins_datetrek, abort";
		exit
	fi
fi
echo "_______________________________";
echo "_______________________________";
#Remove current geojson
rm "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/"*".geojson";

#Get geojson

## First, get randoEcrins files
for i in $lang;
	do
	if [[ `wget -S --spider "https://rando.ecrins-parcnational.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget -O "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrinstreks.geojson"  "https://rando.ecrins-parcnational.fr/api/"$i"/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget -O "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrinstreks_"$i".geojson"  "https://rando.ecrins-parcnational.fr/api/"$i"/treks.geojson";
		fi
	else
		echo "no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

## Second, get cheminDesParcs files
for i in $lang;
	do
	if [[ `wget -S --spider "https://www.cheminsdesparcs.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget -O "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/cheminDesParcstreks.geojson"  "https://www.cheminsdesparcs.fr/api/"$i"/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget -O "/srv/data-paca/www/dev.paca.sitourisme.fr/api/var/data/import/geotrek/cheminDesParcstreks_"$i".geojson"  "https://www.cheminsdesparcs.fr/api/"$i"/treks.geojson";
		fi
	else
		echo "no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

## Third, get rando sisteron buech
#for i in $lang;
#	do
#	if [[ `wget -S --spider "https://rando.sisteron-buech.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
#		then
#		if [[ "$i" = "fr"  ]]
#			then
#			echo "Get fr file";
#			wget -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoSisterontreks.geojson" "https://rando.sisteron-buech.fr/api/fr/treks.geojson";
#			canImport=1
#		else
#			echo "Get "$i" file";
#			wget -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoSisterontreks_"$i".geojson" "https://rando.sisteron-buech.fr/api/"$i"/treks.geojson";
#		fi
#	else
#		echo "no file online for "$i
#	fi
#	echo "_______________________________";
#done

echo "_______________________________";

# launch import
if [[ "$canImport" = 1 ]]
	then
	echo "We can import";

	echo "_______________________________";
    #Dealing with lastUpdate date
    if [[ -f $scriptLocation"dateScriptTmp" ]]
        then
        lastUpdate=`cat $scriptLocation"dateScriptTmp"`
        echo "Last time this script worked : "$lastUpdate" mv it to dateScript before curl"
        mv $scriptLocation"dateScriptTmp" $scriptLocation"dateScript"
    else
        echo "First time."
    fi
    #Generate dateScriptTmp
    currentDate=`date +%Y-%m-%d`
    echo $currentDate > $scriptLocation"dateScriptTmp"

	curl "dev.api.paca.sitourisme.fr/api/products/import?type=geotrek"
else
	echo "no import today";
fi


