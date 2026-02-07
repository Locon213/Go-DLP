<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **Client de bureau yt-dlp moderne**

  Une application de bureau puissante et multiplateforme pour télécharger des vidéos depuis YouTube, Vimeo, TikTok, Instagram, Twitter, SoundCloud et plus de 1000 autres plateformes.

  [🌐 Site web](https://github.com/Locon213/Go-DLP) • [📖 Documentation](#documentation) • [🐛 Problèmes](https://github.com/Locon213/Go-DLP/issues) • [❤️ Parrainer](#donner)

</div>

---

## 🌍 Sélection de la langue | Language Selection | 选择语言

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|
| [README.md](README.md) | [README_RU.md](README_RU.md) | [README_ZH.md](README_ZH.md) | [README_ES.md](README_ES.md) | **README_FR.md** |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| [README_DE.md](README_DE.md) | [README_PT.md](README_PT.md) | [README_JA.md](README_JA.md) | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 Fonctionnalités

- ⚡ **Ultra rapide**: Optimisé pour la vitesse et l'efficacité
- 🔐 **Sécurisé et privé**: Aucun serveur externe impliqué
- 🎥 **Haute qualité**: Conserve la qualité originale
- 🌍 **Support multilingue**: Disponible en 10 langues
- 💻 **Multiplateforme**: Fonctionne sur Windows, macOS et Linux
- 🎨 **Interface moderne**: Belle interface intuitive
- 📁 **Sélection de format**: Choix entre plusieurs formats vidéo/audio
- 🔄 **Convertisseur intégré**: Convertit les vidéos en différents formats
- 🛡️ **Support proxy**: Configure les paramètres proxy pour les réseaux restreints
- 🍪 **Support cookies**: Extrait les cookies des navigateurs ou utilise des fichiers cookies personnalisés

## 📋 Configuration requise

- Windows 7 ou version ultérieure, macOS 10.12 ou version ultérieure, ou Linux
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installé et accessible depuis PATH
- Connexion Internet pour télécharger des vidéos

## 🚀 Installation

### Binaires précompilés

1. Téléchargez la dernière version depuis la [page des versions](https://github.com/Locon213/Go-DLP/releases)
2. Extrayez l'archive
3. Exécutez le fichier

### Compilation depuis le code source

1. Installez [Go](https://golang.org/) (version 1.25.5 ou ultérieure)
2. Installez [Node.js](https://nodejs.org/) (pour la compilation du frontend)
3. Clonez le dépôt:
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. Installez les dépendances:
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. Compilez l'application:
   ```bash
   wails build
   ```
6. Exécutez l'application:
   L'exécutable compilé sera dans le répertoire `build/bin/`:
   ```bash
   ./build/bin/go-dlp
   ```

## 📖 Documentation

### Utilisation de base

1. Lancez l'application Go-DLP
2. Entrez l'URL de la vidéo que vous souhaitez télécharger
3. Cliquez sur "Analyser et télécharger" pour récupérer les formats disponibles
4. Sélectionnez votre format et qualité préférés
5. Choisissez l'emplacement de téléchargement
6. Attendez que le téléchargement soit terminé

### Fonctionnalités avancées

#### Sélection de format
- Parcourez tous les formats disponibles pour la vidéo
- Filtrez par résolution, taille de fichier et qualité
- Affichez un aperçu des détails du format avant de télécharger

#### Convertisseur intégré
- Convertissez les vidéos téléchargées en différents formats
- Prend en charge les formats vidéo et audio courants
- Capacités de conversion par lots

#### Configuration du proxy
- Configurez les paramètres proxy du système
- Configurez le proxy manuellement
- Contournez le proxy pour des domaines spécifiques

#### Support des cookies
- Extrayez les cookies de votre navigateur
- Importez des fichiers cookies personnalisés
- Gérez le contenu avec restrictions d'âge

## 🤝 Contributions

Nous accueillons les contributions de tous! Voici comment vous pouvez aider:

1. Forkez le dépôt
2. Créez une branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Validez vos modifications (`git commit -m 'Add amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

### Guide de traduction

Pour contribuer à la traduction:

1. Localisez les fichiers de traduction dans `frontend/src/i18n/translations.ts`
2. Ajoutez vos traductions en suivant la structure existante
3. Mettez à jour le tableau `supportedLanguages` avec votre langue
4. Soumettez une pull request avec vos modifications

## 📄 Licence

Ce projet est sous licence GNU General Public License v3.0 (GPLv3) - voir le fichier [LICENSE](LICENSE).

### Points clés de la GPL v3:

- Vous pouvez librement exécuter, étudier, partager et modifier le logiciel
- Vous pouvez distribuer des versions modifiées sous la même licence
- Vous devez divulguer le code source de vos modifications
- Vous devez licencer vos modifications sous les mêmes conditions
- Le logiciel est fourni sans garantie

## 🙏 Remerciements

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - La technologie principale derrière Go-DLP
- [Wails](https://wails.io/) - Framework pour créer des applications de bureau avec Go et les technologies web
- [Communauté yt-dlp](https://github.com/yt-dlp/yt-dlp) - Pour maintenir le moteur de téléchargement sous-jacent
- Tous les contributeurs qui ont aidés à traduire et améliorer Go-DLP

## ❤️ Donner

Si vous trouvez Go-DLP utile, envisagez de soutenir le projet:

- Bitcoin (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- Ethereum (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- Tether (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 Signaler des problèmes

Si vous rencontrez des problèmes, veuillez [ouvrir un ticket](https://github.com/Locon213/Go-DLP/issues) avec:

- Description détaillée du problème
- Étapes pour reproduire
- Comportement attendu
- Comportement actuel
- Captures d'écran si applicable
- Votre système d'exploitation et version de Go-DLP

## 🆘 Support

Pour une aide supplémentaire:

- Recherchez dans les [tickets](https://github.com/Locon213/Go-DLP/issues) existants
- Rejoignez nos [Discussions](https://github.com/Locon213/Go-DLP/discussions)

---

<div align="center">
  <sub>Créé avec ❤️ par <a href="https://github.com/Locon213">Locon213</a></sub>
</div>
