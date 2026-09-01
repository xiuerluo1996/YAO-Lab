# Yao Lab — Group Website

English website for the research group of **Prof. Zhongping Yao (姚锺平)**,
Department of Life Sciences, The Hong Kong Polytechnic University.

## Structure

```
yao-lab/
├── index.html            Home
├── pi.html               Principal Investigator
├── research.html         Research directions (7 topics + SVG figures)
├── people.html           Group members (JSON-driven)
├── publications.html     Selected publications (JSON-driven)
├── join.html             Open positions (JSON-driven)
├── portal.html           Research Portal (Netlify Identity gated)
├── assets/
│   ├── style.css         Shared styles
│   ├── main.js           Shared behaviour
│   └── img/*.svg         7 original research-direction graphics
├── content/
│   ├── people.json       Editable via CMS
│   ├── publications.json Editable via CMS
│   └── openings.json     Editable via CMS
├── admin/
│   ├── index.html        Decap CMS entry
│   └── config.yml        CMS collections (People / Publications / Openings)
└── netlify.toml          Netlify config
```

## Local preview

Pages that read `content/*.json` use `fetch()`, which browsers block over `file://`.
Preview with a local HTTP server, e.g.:

```bash
cd yao-lab
npx serve .          # or: python -m http.server 8000
```

## Deploy to Netlify (free)

1. Push this folder to a **GitHub** repository (public or private).
2. On [netlify.com](https://app.netlify.com), **Add new site → Import from Git → GitHub**, select the repo.
   - Build command: *(leave empty)*
   - Publish directory: `.`
3. Deploy. You will get a free URL like `https://<site-name>.netlify.app`.

## Enable login & editing (Netlify Identity + Git Gateway)

Editing permission is granted by inviting people in the Netlify dashboard (registration is invite-only), so only the listed editors can sign in and change content.

1. In Netlify: **Site settings → Identity → Enable Identity**.
2. Set **Registration → Invite only**.
3. **Identity → Services → Enable Git Gateway**.
4. Invite exactly these editors (**Identity → Invite users**):

   | Editor | Email |
   |---|---|
   | Mr. Xiuer Luo | xiuerluo1996@gmail.com |

   *(Prof. Zhongping Yao and Dr. Weiwei Chen can be added later the same way.)*

   - Invited editors sign in at `https://<site>.netlify.app/admin/` to edit People / Publications / Openings.
   - Everyone else has no account and is read-only.
5. The **Research Portal** (`/portal.html`) uses the same Identity — invite all lab members who should view protocols.

   > Note: with a single Identity pool, anyone you invite can technically open `/admin/` too. If you need to separate "protocol viewers" from "editors", ask to add role-based access.

## Editing content

- Open `https://<site>.netlify.app/admin/` and sign in with the invited email.
- Edit **People** (photos, bios, emails, links), **Publications**, and **Openings**.
- Changes are committed back to the Git repo and republished automatically.

## Notes

- Research directions and PI information are currently hard-coded in `index.html`, `pi.html` and `research.html`. To change them, edit those files (or ask to move them into the CMS).
- Publication figures are **original SVG** graphics (no copyrighted journal images are used).
- The publications list is a starting subset (2021–2026); complete it via the CMS or from an ORCID export.
