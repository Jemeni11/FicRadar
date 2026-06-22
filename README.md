<a id="readme-top"></a>

<div align="center">
  <a href="https://github.com/Jemeni11/FicRadar">
    <img src="public/icon.png" alt="FicRadar Logo" width="80" height="80">
  </a>

<h1 align="center">FicRadar</h1>

<p align="center">
    A browser extension for discovering the stories others love.
    <br /><br />
    <a href="https://github.com/Jemeni11/FicRadar"><strong>Explore the repo »</strong></a>
  </p>
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Supported Sites](#supported-sites)
- [Features](#features)
- [How Recommendations Work](#how-recommendations-work)
- [TODO / Future Work](#todo--future-work)
- [Installation](#installation)
  - [Browser Extension Stores](#browser-extension-stores)
  - [Firefox Compatibility Notes](#firefox-compatibility-notes)
  - [Using Pre-built Files](#using-pre-built-files)
  - [Building From Source](#building-from-source)
    - [Development Build](#development-build)
      - [Firefox for Android Development](#firefox-for-android-development)
    - [Production Build](#production-build)
- [Usage](#usage)
  - [Supported Files](#supported-files)
  - [Batch Author Scraping](#batch-author-scraping)
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

**FicRadar** is a browser extension that extracts and ranks fanfiction links from visible forum activity.

It helps you discover stories people (especially your favorite authors) keep reading, replying to, recommending, or talking about.

You can use it to:

- find what specific authors are reading
- scrape multiple authors in one batch
- build recommendation lists from forum activity
- export discovered stories into external tools

This project is built with [WXT](https://wxt.dev/). Before v2.0.0, [Plasmo](https://docs.plasmo.com/) was used.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Supported Sites

- **SpaceBattles**
- **Sufficient Velocity**
- **Questionable Questing**

📝 _On these XenForo-based forums, FicRadar ranks links by how frequently they appear in visible forum activity._

## Features

- Scrapes story links from forum activity
- Counts and ranks repeated thread interactions
- Supports single-author scans and batch author uploads
- Detects and marks stories authored by the scanned author
- Filters results by All / Discovered / Authored, with title search
- Exports individual author results or all completed author results together
- Export links in multiple formats:
  - JSON
  - CSV
  - TXT (links-only)
  - HTML
  - Browser-importable bookmarks
- No tracking, no accounts, no backend service

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## How Recommendations Work

FicRadar treats visible forum activity as recommendation evidence.

If an author keeps posting in, replying to, or interacting with a thread, FicRadar treats that as a signal the story might be worth checking out.

In single-author mode, stories are mainly ranked by repeated interactions.

When multiple authors are uploaded, FicRadar currently scrapes them as separate authors and can export their completed results together.

Likes are not used.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## TODO / Future Work

These are planned ideas, not current v2 features:

- Combine multiple authors into a shared recommendation view.
- Prioritize stories seen across multiple authors over stories strongly associated with only one person.
- Add local cache and scrape resume support for long-running scans.
- Add user-configurable cache settings.
- Explore AO3 support for bookmarks or subscriptions, where ranking may work differently.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

### Browser Extension Stores

- [Chrome Web Store](https://chromewebstore.google.com/detail/ficradar/fghclogjcpjoiefcecibmedgocnogmbj)
- [Mozilla Firefox Browser Add-ons](https://addons.mozilla.org/en-US/android/addon/ficradar/)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/ficradar/kechmepbngbdnjgdoefjnbiainbikdpi)
  <!-- - [Opera Add-ons]() -->

### Firefox Compatibility Notes

Minimum supported versions:

> [!NOTE]
> The actual minimum Firefox version is 79. This is from the test run on addons.mozilla.org. The APIs used are supported from 54, but the manifest/package.json has keys that require 140+.

- Firefox Desktop: 140
- Firefox for Android: 142

The extension uses these Firefox APIs:

| API              | Firefox Desktop | Firefox Android |
| ---------------- | --------------- | --------------- |
| `runtime.getURL` | 45 (2016-03-08) | 48 (2016-08-02) |
| `tabs.create`    | 45 (2016-03-08) | 54 (2017-06-13) |
| `tabs.update`    | 45 (2016-03-08) | 54 (2017-06-13) |

_The APIs determine the minimum Android version._

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Using Pre-built Files

1. Enable Developer Mode in Chrome or Firefox.
2. Visit the [Releases Page](https://github.com/Jemeni11/FicRadar/releases) and download:
   - `chrome-mv3-prod.zip` for Chromium browsers
   - `firefox-mv2-prod.zip` for Firefox

3. Load it manually via your browser’s developer tools.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Building From Source

> [!NOTE]
>
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

##### Firefox for Android Development

This is slightly more complicated, so here’s the [official guide](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/).

#### Production Build

```bash
pnpm build          # Chrome
pnpm build:firefox  # Firefox
```

Then load the resulting build folder as an unpacked extension.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

> [!IMPORTANT]
>
> You **must** be logged in to the target forum before scanning. If you are logged out, XenForo alters link structures and disables certain search features, which will cause the scraper to fail or miss authored stories.

1. Navigate to a supported user profile page and copy the URL.
2. Click the FicRadar icon.
3. Paste the URL or upload a supported file. See the [supported files](#supported-files) section for more info.
4. The extension will open a new tab and scrape the author’s forum activity for fanfiction links.
5. Export the results in your preferred format.

### Supported Files

- [TalesTrove](https://www.github.com/Jemeni11/TalesTrove) TXT (Regular. LinksOnlyTXT isn't supported) and JSON
- TXT files with line breaks separating each link, or lines like: `Author Link: https://...`
- JSON files with an `authorLink` field

### Batch Author Scraping

You can upload multiple author profile links in one file.

FicRadar scrapes each author separately, shows their results per author, and can export all completed author results together.

Shared recommendation ranking across authors is planned for a later version.

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

Only locally on your own device.

FicRadar uses browser storage to pass data between extension pages.

Nothing is uploaded anywhere else.

There’s no backend service, no accounts, and no tracking.

**Why do I need to be logged in?**

XenForo forums behave differently for guests than for logged-in users. When you are logged out:

- Certain search pages and user activity feeds are restricted or hidden entirely.
- Link structures change (e.g., appending trailing slashes or using hash fragments), which breaks the extension's ability to count and rank duplicate stories accurately.
- The scraper cannot accurately separate stories the author wrote from stories they just commented on.

To ensure the extension works properly, always log in to the forum before starting a scan.

**Why are some stories marked as authored works?**

Some XenForo search pages include both stories an author reads and stories they wrote themselves.

FicRadar can detect authored works separately so they can be marked, filtered, or exported independently.

**Isn’t this shady?**

I don’t think so.

All this data is already publicly visible to people who can access the relevant forum pages. FicRadar just automates collecting and ranking it.

If you don’t want your forum activity visible, most forums already let you hide your profile or restrict access. FicRadar doesn’t bypass that.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Pull requests welcome! Bug reports, feature requests, or docs help are all appreciated. Just fork the repo and send it.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Why did I build this?

I like fanfiction. And I really like knowing what my favourite authors are reading. The idea behind FicRadar was: “if they write good stories, they probably read good stories.”

So FicRadar became a way to see what stories people keep reading, commenting on, or talking about.

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
