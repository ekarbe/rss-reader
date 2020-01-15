</br>
<div align="center">
  <img src="https://raw.githubusercontent.com/ekarbe/rss-reader/master/assets/rss-reader.png" alt="Logo" width="250px"></img>
</div>
</br>
<div align="center">
  <h1>RSS-Reader</h1>
  <h2>A Visual Studio Code extension to show the feeds of up to 10 RSS in a sidebar widget.</h2>
</div>
</br>

## Features

The RSS-Reader provides you with a Treeview which can show up to 10 separated views or a consolated one with no limit.

The `Feeds` setting should be formatted like:
```
   "RSSReader.Feeds": [
      {
        "identifier": "L",
        "title": "Lorem",
        "url": "https://ipsum.com/rss"
      },
      {
        "identifier": "F",
        "title": "foo",
        "url": "https://bar.org/feed.xml"
      }
    ]
```

The `identifier` should be a maxium of 3 characters. Otherwise it may look bad. For now the `title` option has no function, because the api to change the title of a view is still unreleased.

## Requirements

This extension requires Visual Studio Code 1.40.x or later and an active connection to the internet to work properly.

## Extension Settings

- `RSSReader.Feeds`: Controls the feeds for the RSS-Reader.
- `RSSReader.Consolidated`: Enable/disable consolidated mode.
- `RSSReader.Update`: Enable/disable auto update.
- `RSSReader.Interval`: Controls the update interval in minutes.
- `RSSReader.Identifier`: Enable/disable the identifier in the consolidated mode.
- `RSSReader.OpenType`: Controls the primary action for feed entries.

## Known Issues

- [Bug issue board](https://github.com/ekarbe/rss-reader/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

## Planned features

- [Enhancement issue board](https://github.com/ekarbe/rss-reader/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)

## Release Notes

For all releases take a look at the [Changelog](CHANGELOG.md).

### 1.0.0

- Initial release

### 1.1.0

- Added identifier to consolidated view

### 1.2.0 [Unreleased]

- Added open in editor function