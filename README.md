<a id="readme-top"></a>

<div align="center">
  <a href="https://github.com/Jemeni11/FicRadar">
    <img src="assets/icon.png" alt="FicRadar Logo" width="80" height="80">
  </a>

<h1 align="center">FicRadar</h1>

<p align="center">
    Fanfic recs without asking.  
    <br />
    A browser extension for discovering the stories others love.
    <br /><br />
    <a href="https://github.com/Jemeni11/FicRadar"><strong>Explore the repo »</strong></a>
  </p>
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Supported Sites](#supported-sites)
- [Planned Support](#planned-support)
- [Features](#features)
- [Installation](#installation)
  - [Browser Extension Stores](#browser-extension-stores)
  - [Using Pre-built Files](#using-pre-built-files)
  - [Building From Source](#building-from-source)
    - [Development Build](#development-build)
    - [Production Build](#production-build)
- [Usage](#usage)
  - [Supported Files](#supported-files)
  - [Example Workflows](#example-workflows)
    - [With fichub-cli](#with-fichub-cli)
    - [With FanFicFare](#with-fanficfare)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Why did I build this?](#why-did-i-build-this)
- [Who are you?](#who-are-you)
- [License](#license)
- [Changelog](#changelog)

## Introduction

**FicRadar** is a browser extension that extracts and ranks fanfiction links from user-visible forum posts and interactions. It helps you discover stories that people (especially your favorite authors) frequently interact with—by scraping and ranking their forum activity.

This project is built with the [Plasmo](https://docs.plasmo.com/) framework.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Supported Sites

- **SpaceBattles**
- **Sufficient Velocity**
- **Questionable Questing**

📝 _On these XenForo-based forums, FicRadar can rank links by how frequently they appear._

## Planned Support

- **Archive Of Our Own (AO3)** – Bookmarks, Subscriptions (ranking won’t apply here)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

- Scrapes story links from all user forum posts (except profile posts)
- Counts and ranks by frequency (for forums, including older posts)
- No tracking, no saved data—everything is ephemeral
- Export links in multiple formats:
  - JSON
  - CSV
  - TXT (links-only)
  - HTML
  - Browser-importable bookmarks
- Clean and responsive UI

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

### Browser Extension Stores

- [Chrome Web Store](https://chromewebstore.google.com/detail/ficradar/fghclogjcpjoiefcecibmedgocnogmbj)
- [Mozilla Firefox Browser Add-ons](https://addons.mozilla.org/en-US/android/addon/ficradar/)
  <!-- - [Microsoft Edge Add-ons]() -->
  <!-- - [Opera Add-ons]() -->

### Using Pre-built Files

1. Enable Developer Mode in Chrome or Firefox.
2. Visit the [Releases Page](https://github.com/Jemeni11/FicRadar/releases) and download:

   - `chrome-mv3-prod.zip` for Chromium browsers
   - `firefox-mv2-prod.zip` for Firefox

3. Load it manually via your browser's developer tools.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Building From Source

> You need [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

```bash
git clone https://github.com/Jemeni11/FicRadar.git
cd FicRadar
pnpm install
```

#### Development Build

```bash
pnpm dev
```

#### Production Build

```bash
pnpm build          # Chrome
pnpm build:firefox  # Firefox
```

Then load the resulting build folder as an unpacked extension.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

> You must be logged in to the forum for data to be extracted.

1. Navigate to a supported user profile page and copy the URL.
2. Click the FicRadar icon.
3. Paste the URL or, upload a supported file. See the [supported files](#supported-files) section for more info.
4. The extension will open a new tab and scrape the author's forum activity for fanfiction links.
5. Export the results in your preferred format.

### Supported Files

- [TalesTrove](https://www.github.com/Jemeni11/TalesTrove) TXT (Regular. LinksOnlyTXT isn't supported) and JSON
- TXT file with line breaks separating each link, or with lines like: `Author Link: https://...`
- JSON files with a `authorLink` field.

### Example Workflows

Downloading the stories found:

#### With [fichub-cli](https://github.com/FicHub/fichub-cli)

```bash
fichub_cli -i stoleThunderNotLightning_stories.txt
```

#### With [FanFicFare](https://github.com/JimmXinu/FanFicFare)

```bash
fanficfare -i stoleThunderNotLightning_stories.txt
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## FAQ

**Do you store my data?**  
Yes. Only on your own device. The extension uses the browser’s local storage to transfer data between components (from the popup to the open tab). Your data isn't sent anywhere else. You can open the network tab on the new tab page to confirm. FicRadar doesn’t track, save, or upload anything.

**Why do I need to be logged in?**  
Because some platforms (like QQ on some pages and AO3) require login to access subscription data. You could try without it. It could work. This hasn't been tested.

**Isn't this shady?**  
I don't think so. All this data is already publicly available. This extension just automates a process anyone could carry out manually. If you don't want your interactions on XenForo forums to be publicly visible, you can just hide your profile. This extension can’t get around that.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Pull requests welcome! Bug reports, feature requests, or docs help are all appreciated. Just fork the repo and send it.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Why did I build this?

I like fanfiction. And I really like knowing what my favourite authors are reading. FicRadar is a way to see what stories they keep reading, commenting or talking about.

Also, I’ve built other tools in this space like [FicImage](https://github.com/Jemeni11/FicImage), [TalesTrove](https://github.com/Jemeni11/TalesTrove) and contributed to [WebToEpub](https://github.com/dteviot/WebToEpub) and [Leech.py](https://github.com/kemayo/leech).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Who are you?

Hi! I'm Emmanuel Jemeni, a Frontend Developer.

- [LinkedIn](https://www.linkedin.com/in/emmanuel-jemeni)
- [GitHub](https://github.com/Jemeni11)
- [Twitter/X](https://twitter.com/Jemeni11_)
- [Bluesky](https://bsky.app/profile/jemeni11.bsky.social)

If you'd like, you can support me on [GitHub Sponsors](https://github.com/sponsors/Jemeni11/) or [Buy Me A Coffee](https://www.buymeacoffee.com/jemeni11).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

[GPL-3.0 License](/LICENSE)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Changelog

See [CHANGELOG](/CHANGELOG.md) for version history.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
