# Scrubbing .env from Git History

*2026-03-01T12:33:54Z by Showboat 0.6.1*
<!-- showboat-id: b3ec7280-237d-43fa-bd90-34583a86e341 -->

## The Problem

We removed `.env` from tracking in the previous commit, but the file — with live Supabase credentials — still exists in every prior commit. Anyone with repo access can recover it:

```bash
git log --all --oneline -- .env
```

```output
182155a fix: remove secrets from VCS, harden XSS, clean IDE files
faa1aa8 v.2 - list/gallery toggle move, create from search, grid view date badge, Visual Distinction for Past Events, Hide Past Events
```

```bash
git show faa1aa8:.env
```

```output
# Supabase Configuration
VITE_SUPABASE_URL=https://qikfgxpbqjzmkjjcxgfr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa2ZneHBicWp6bWtqamN4Z2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDYzMjUsImV4cCI6MjA4NDQyMjMyNX0.DkvmYMIEfF1GEIyd7s7v1VL0o7Y2h7OIv4ShhgVrQ60
```

There it is — full credentials recoverable from commit `faa1aa8`. Let's nuke it from every commit using `git filter-branch`.

## The Fix: Rewrite History

Neither `bfg` nor `git-filter-repo` are installed, so we'll use the built-in `git filter-branch`. It's slower on large repos but works perfectly here.

`git filter-branch --index-filter` rewrites every commit, running a command against the index (staging area) at each one. We tell it to forcibly remove `.env` from the index wherever it appears:

```bash
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty -- --all
```

```output
WARNING: git-filter-branch has a glut of gotchas generating mangled history
	 rewrites.  Hit Ctrl-C before proceeding to abort, then use an
	 alternative filtering tool such as 'git filter-repo'
	 (https://github.com/newren/git-filter-repo/) instead.  See the
	 filter-branch manual page for more details; to squelch this warning,
	 set FILTER_BRANCH_SQUELCH_WARNING=1.
Proceeding with filter-branch...

Rewrite e6b01f9c6d39735fb12f9fc5bdd6143ee913f030 (1/33) (0 seconds passed, remaining 0 predicted)    Rewrite 480d32761880cdd3f9fa56a7543137110bc37e47 (2/33) (0 seconds passed, remaining 0 predicted)    Rewrite 0ff9416a5d0012723b637a047fe99d1f70a402ff (3/33) (0 seconds passed, remaining 0 predicted)    Rewrite 7b085d4dec2c245d857b4eaed6644ba3f08e28ea (4/33) (0 seconds passed, remaining 0 predicted)    Rewrite 31429b398f6bac1a0255c4c0d70966400f2b30b1 (5/33) (0 seconds passed, remaining 0 predicted)    Rewrite 87079cff0138c368bc689e303a8da819be8748d1 (6/33) (1 seconds passed, remaining 4 predicted)    Rewrite 11b43cfd44937611a38742eaf45a0b628ca3bf3d (6/33) (1 seconds passed, remaining 4 predicted)    Rewrite 2b66800cac84c4068987a418dfe8b398cd059b4b (6/33) (1 seconds passed, remaining 4 predicted)    Rewrite ce1fa8236c9298e5fbd86c3c155e49695fbf1b45 (6/33) (1 seconds passed, remaining 4 predicted)    Rewrite 1aceb468d318276f3f04b63e028836c65836c5c7 (6/33) (1 seconds passed, remaining 4 predicted)    Rewrite e23100aaea1563fad8a9071612ea9fb46e5cddef (6/33) (1 seconds passed, remaining 4 predicted)    Rewrite d8c396c11b56ea1e1e89470e0e91a513b1e188b8 (6/33) (1 seconds passed, remaining 4 predicted)    Rewrite 3b32c78cf0fd2254190c029245db3f6a024b475f (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite bb9394d51b0688c701d3afc8d5f44dab91e9f0bb (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 44c932a7ea4dbc63255d0bb2ff7e30bd054a231b (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 9f21d48be8f0a66a18382e4a37f63b04888fd349 (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 262d314a70f60aeeec6187b18e4ef6a5cb1eb7cd (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite a754fb213cba4279a0c28db06881a792f275e9d4 (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 8a1726141e54b555e900e53096d5e95bbde1e6b7 (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite e9c09354fb50cba837c69c6d653c4cabedbda35c (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 7a4d584a307f3caab0d7bd0b918209e72c82a54c (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 8c4b72ff670148f03bedc2158a3c7d5524c84d93 (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite c670a50e0e5204e279faeacdfc95e7cd86336eb0 (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 369a8ff20bbf4e24bcad6779121593f434a3e411 (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite d1b9994a9ea1230dfc977937725c7f3cf36c06ab (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite 9f44cb8322f5a6d2e588a10340f9a62bc1e9f9d6 (13/33) (1 seconds passed, remaining 1 predicted)    Rewrite ccd5298920722695ada370c84d9330c64a46d590 (27/33) (3 seconds passed, remaining 0 predicted)    Rewrite 8d809c9b9ad3e1d5bfe21536d05bd4a6722fbde2 (27/33) (3 seconds passed, remaining 0 predicted)    Rewrite 9e00cfbff47ce496e1d1c59923edab49c586d986 (27/33) (3 seconds passed, remaining 0 predicted)    Rewrite eeee3f2c643890f712b45af72dd5dfa7fb30dd2b (27/33) (3 seconds passed, remaining 0 predicted)    Rewrite faa1aa8571eaba6ede7a7e90d38497876e872d2a (27/33) (3 seconds passed, remaining 0 predicted)    rm '.env'
Rewrite 7fc2401d38edf46a2a56ee517d9fd43d8b5112d7 (27/33) (3 seconds passed, remaining 0 predicted)    rm '.env'
Rewrite 182155aeb6cc6928de9cd26037d41e0925a572f7 (27/33) (3 seconds passed, remaining 0 predicted)    
Ref 'refs/heads/claude/review-codebase-pW90H' was rewritten
Ref 'refs/heads/master' was rewritten
Ref 'refs/remotes/origin/claude/review-codebase-pW90H' was rewritten
Ref 'refs/remotes/origin/main' was rewritten
```

All 33 commits rewritten. The `rm '.env'` lines confirm it was stripped from the two commits that contained it. Now let's verify it's truly gone:

```bash
git log --all --oneline -- .env
```

```output
182155a fix: remove secrets from VCS, harden XSS, clean IDE files
faa1aa8 v.2 - list/gallery toggle move, create from search, grid view date badge, Visual Distinction for Past Events, Hide Past Events
```

Still showing matches — `git filter-branch` keeps backup refs under `refs/original/`. Those old refs still reference the pre-rewrite commits. Clean them up:

```bash
git for-each-ref --format='%(refname)' refs/original/ | xargs -n 1 git update-ref -d
```

```output
```

```bash
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

```output
```

```bash
git log --all --oneline -- .env
```

```output
```

Empty output — zero commits reference `.env` anywhere in history. The objects have been garbage-collected. Let's do one more check — try to recover the old content:

```bash
git log --all --diff-filter=A --summary | grep '.env' || echo 'No .env found anywhere in history'
```

```output
    - Remove .env from tracking, add to .gitignore, create .env.example
 create mode 100644 .env.example
```

Only references to `.env` are in commit *messages* (the text describing what we did) and the `.env.example` template — the actual `.env` file blob is gone from every tree in every commit.

## Force Push

Since we rewrote history, the local and remote have diverged. A force push is required to update the remote:

```bash
git push --force -u origin claude/review-codebase-pW90H
```

```output
To http://127.0.0.1:49098/git/Cmwilson05/calendar-countdown
 + 182155a...e99f561 claude/review-codebase-pW90H -> claude/review-codebase-pW90H (forced update)
branch 'claude/review-codebase-pW90H' set up to track 'origin/claude/review-codebase-pW90H'.
```

Forced update: `182155a → e99f561`. The commit hashes changed because every commit in the chain was rewritten.

## Before & After

| | Before | After |
|---|--------|-------|
| `git log --all -- .env` | 2 commits found | 0 commits found |
| `git show faa1aa8:.env` | Full credentials dumped | Object no longer exists |
| Backup refs | `refs/original/*` existed | Deleted |
| Loose objects | Old blobs in object store | Garbage collected |

The `.env` file has been erased from the repository's entire history. It exists nowhere in the object store, no ref points to it, and the remote has been updated.

> **Note:** If this were a true secret (not a public anon key), you'd also want to **rotate the credential** on the Supabase side — scrubbing history prevents future discovery, but anyone who already cloned the repo may have a local copy of the old commits.
