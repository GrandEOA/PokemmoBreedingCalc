# PokeMMO Breeding Planner

A static, GitHub Pages-friendly breeding calculator/checklist for PokeMMO.

## Included

- Target Pokémon, Nature, and IV setup
- 6×31 / 5×31 quick buttons
- Personal breeder inventory
- IVs, gender, nature, price, and notes for each owned Pokémon
- Editable breeding-plan checklist
- Brace / Everstone cost tracking
- Browser persistence with `localStorage`
- JSON export/import
- No backend required
- Responsive dark UI

## Run locally

You can simply open `index.html` in a browser.

For a local development server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Put it on GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, and `app.js`.
3. Push/commit them to the default branch.
4. In GitHub, open **Settings → Pages**.
5. Set the source to **Deploy from a branch**.
6. Select your default branch and `/ (root)`.
7. Save.

GitHub will provide the Pages URL.

## PokeMMO mechanics used

The planner's assumptions are based on PokeMMO breeding references:

- Both parents are consumed when breeding.
- One egg is produced.
- Three IVs are inherited directly.
- The other three IVs are the floor of the two parents' average for that stat.
- A Power item/brace forces its corresponding IV and counts as one of the three direct IV inheritances.
- Everstone passes the holder's Nature.
- Community guides list braces at $10,000 each.

References:

- PokeMMO forum breeding guide: https://forums.pokemmo.com/index.php?/topic/49440-the-breeding-guide/
- PokeMMO Wiki/community breeding page: https://pokemmo.shoutwiki.com/wiki/Breeding
- Current community-maintained guide checked while building this project: https://pokemmo.wiki/guides/pokemmo-breeding-guide

## Important limitation of this first version

The UI and storage are complete, but the route generator is deliberately a **starter planner**, not a mathematically exhaustive optimizer. It does not yet:

- verify every egg-group combination,
- simulate all possible three-direct-IV outcomes,
- optimize the complete breeding tree against your inventory,
- account for every gender ratio,
- calculate GTL breeder purchase costs automatically,
- model egg moves/abilities/alpha/HA constraints.

The generated route should therefore be treated as a checklist template. Always verify the actual PokeMMO breeding preview before confirming a breed.

## Suggested next upgrade

The next version can turn this into a true optimizer by representing each breeder as a state:

`species + egg groups + gender + IV vector + nature + ability + special flags`

and then searching possible breeding transitions while charging for braces, Everstones, gender selection, and parent acquisition.

That would allow queries such as:

> "I own these 14 Pokémon. What is the cheapest way to produce a Jolly 5×31 Garchomp?"

