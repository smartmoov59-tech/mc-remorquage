# MC Remorquage — crédits, licences et points à compléter

Site 100 % statique (HTML / CSS / JS), sans back-end ni abonnement : rien à payer pour le faire tourner.
Ouvrir `index.html` suffit pour le voir en local ; pour le mettre en ligne, déposer le dossier tel quel.

## Données de l'entreprise
- Fiche Google Maps « MC REMORQUAGE » : adresse, téléphone, ouvert 24h/24 7j/7, note 5,0 (20 avis, relevée le 07/11/2026), 5 avis texte repris (noms abrégés).
- Registre Sirene (recherche-entreprises.api.gouv.fr) : Christophe Murcia, entrepreneur individuel, SIREN 489 440 453, SIRET 489 440 453 00079, APE 52.21Z, immatriculé le 30/03/2006 — repris dans les mentions légales.
- Contenus du site (services, zones 04/05/13/83/84, « Enlèvement d'épaves gratuit », « Votre mobilité, notre priorité ») : maquette fournie par le client.

## Médias
- `assets/img/mc-mustang-plateau.jpg` : photo de la fiche Google de MC Remorquage (à remplacer par ses propres photos dès que possible).
- Photos libres de droits (Pexels, usage commercial autorisé, sans attribution obligatoire) : numéros Pexels 17429097, 943930, 5982898, 12478166, 22880409, 8478228, 29271763, 27692129, 8931963, 8669165, 11681893, 19138473, 2790919, 16002695, 36378946, 36397935, 24960483, 6140995.
- Vidéos libres de droits (Pexels) : n° 37456060 (intro du site, `hero-540.mp4`) et n° 37456065 (étape « On arrive », `story-540.mp4`). Ce sont des images d'illustration de dépanneuses américaines : à remplacer par une vidéo tournée avec la vraie dépanneuse.

## Technique (tout est hébergé dans `assets/`)
- GSAP 3.12.5 + ScrollTrigger (licence GSAP, gratuite), Lenis 1.1.18 (MIT), qrcode-generator 1.4.4 (MIT).
- Polices : Big Shoulders Display et Barlow (SIL Open Font License), hébergées localement (pas d'appel à Google Fonts).
- Contours des départements : gregoiredavid/france-geojson (données IGN / Etalab, Licence Ouverte).

## Réservation sans abonnement
Le formulaire prépare la demande sur l'appareil du client :
- téléphone : bouton « Envoyer par SMS » → l'appli SMS s'ouvre avec le message déjà rédigé au 06 28 15 23 67 (il ne reste qu'à appuyer sur Envoyer) ;
- ordinateur : un QR code à scanner ouvre ce même SMS sur le téléphone ;
- « Par e-mail » → `christophemurcia64@gmail.com` ; « Copier » ; fichier agenda `.ics` si un créneau est planifié.

## À compléter / vérifier avant la mise en ligne
1. Adresse finale du site : renseigner l'URL absolue dans `og:image` et dans le JSON-LD (champ `image`) de `index.html`.
2. Mentions « Sans péage » et « Paiement sécurisé » de la maquette : non reprises (sens à confirmer avec Christophe).
3. Page Facebook : aucune page trouvée, donc aucun lien.
4. Hébergeur : à ajouter aux mentions légales une fois le site publié.
5. Tarifs : aucun prix public trouvé ; le site dit « sur devis » (seul l'enlèvement d'épave est annoncé gratuit, d'après la maquette).
