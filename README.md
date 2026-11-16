# akhilthomas.in

Personal site of Akhil Thomas — cloud consultant and photographer.
Built with [Jekyll](https://jekyllrb.com) and hosted on GitHub Pages: every push to
`master` rebuilds and publishes the site automatically. No build tools needed.

## Add photos (the 30-second version)

1. On GitHub, open the [`photos/`](photos) folder and pick an album folder (e.g. `travel`).
2. **Add file → Upload files**, drop your images, **Commit changes**.
3. Done. A minute later they're in the gallery at `/photography/`, and the newest
   ones show on the home page.

That's all that is required. The rest below is optional polish.

### Albums

Each sub-folder of `photos/` is an album and becomes a filter button on the gallery
page. To create a new album, upload into a new folder name — on the upload page,
type e.g. `photos/street/` in the path box. Use lowercase and hyphens
(`night-sky` shows as "Night sky").

### File names → captions and order

Name files `YYYY-MM-short-title.jpg` and the site does the rest:

| File name                         | Shown as                     |
| --------------------------------- | ---------------------------- |
| `2026-11-misty-morning.jpg`       | **Misty morning** · Nov 2026 |
| `2026-11-16-tea-estates.jpg`      | **Tea estates** · Nov 2026   |
| `2025-old-town.jpg`               | **Old town** · 2025          |
| `IMG_4432.jpg`                    | *(no caption)*               |

Dated files are shown newest first; files without a date come after them.

### Custom titles and locations (optional)

Add an entry to [`_data/photos.yml`](_data/photos.yml), keyed by the file name:

```yaml
2026-11-misty-morning.jpg:
  title: First light over Munnar
  location: Munnar, Kerala
```

### Before you upload

Export at about **2400 px on the long edge, JPEG quality ~80** (roughly 300–800 KB
each). Full-resolution camera files make the gallery slow and fill up the repository.

### Remove a photo

Open the file on GitHub → **⋯ → Delete file** → commit.

## Edit everything else

| What                                         | Where                                         |
| -------------------------------------------- | --------------------------------------------- |
| Name, role, location, email, résumé, socials | [`_config.yml`](_config.yml)                  |
| Work experience                              | [`_data/experience.yml`](_data/experience.yml) |
| Skills                                       | [`_data/skills.yml`](_data/skills.yml)        |
| Education, certifications, awards            | [`_data/credentials.yml`](_data/credentials.yml) |
| About text, hero line, section headings      | [`index.html`](index.html)                    |
| Gallery page intro                           | [`photography.html`](photography.html)        |
| Hero background / portrait                   | replace `assets/img/hero.jpg` / `assets/img/portrait.jpg` (keep the names) |
| Colours and fonts                            | variables at the top of [`assets/css/site.css`](assets/css/site.css) |

The data files are plain YAML — copy an existing block, change the text, commit.
Keep the indentation (two spaces) as it is.

## Preview locally (optional)

```bash
bundle install
```

```bash
bundle exec jekyll serve
```

Then open <http://localhost:4000>.
