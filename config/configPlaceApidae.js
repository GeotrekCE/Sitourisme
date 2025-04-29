const placeApidae = (lieuTxt) => {
    const places = {
        'Maison de la Vallée du Champsaur, Pont-du-Fossé':                  11436, // Maison de la Vallée du Champsaur
        'Maison du Parc national des Ecrins, Châteauroux-les-Alpes':        10721, // Maison du Parc national des Ecrins - Embrunais
        'Maison du Parc national des Ecrins, Briançon':                     10727, //Maison du Parc national des Ecrins - Briançonnais
        'Maison du Parc national des Ecrins, Entraigues':                   6765,  //Maison du Parc du Valbonnais
        'Maison du Parc national des Ecrins, La Chapelle-en-Valgaudemar':   11437, //Maison du Parc du Valgaudemar
        'Maison du Parc national des Ecrins, Le Bourg d’Oisans':            11463, //Maison du Parc de l'Oisans
        'Maison du Parc national des Ecrins, Vallouise':                    6765,  //Maison du Parc du Valbonnais
    }
    return places[lieuTxt] || null
}

module.exports = { placeApidae }