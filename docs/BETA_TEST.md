# First public beta: checklist

## 0. Before anything goes public
- [ ] Check the course's and the university's policies on sharing practice material that is modeled on their exams. If you aren't sure, ask the instructor.
- [ ] Pick a license (for example MIT) and add a `LICENSE` file, or leave it out to keep all rights.
- [ ] Repo name: the site will live at `https://<your-username>.github.io/<repo-name>/`.

## 1. Publish (about 10 minutes)
1. Create an empty **public** repository on github.com. Don't add a README, because this folder has one.
2. From this folder:
   ```
   git init -b main
   git add .
   git commit -m "Energy Sprint v3.2: public beta"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab. The "Deploy to GitHub Pages" run builds the site, runs every test (about 5 minutes), and deploys only if they all pass.
5. Open `https://<your-username>.github.io/<repo-name>/`.

## 2. Smoke test it yourself on the live URL (15 minutes)
- [ ] Phone and laptop. Use at least one Safari (iPhone/Mac) and one Chrome.
- [ ] The welcome pop-up appears on the first visit and not again after "Got it". The Mock exam tile is ringed "Start here" until you open it.
- [ ] Sprint: answer a few, reload mid-sprint, and check that it resumes. Then finish it.
- [ ] Mock exam: answer 2 questions, close the tab, reopen, and resume.
- [ ] Drill: finish one.
- [ ] Progress shows all of it and says "Saved in this browser".
- [ ] Close the browser completely, reopen the URL, and check that progress is still there.
- [ ] Export, then Import on a second browser. The history appears there.

## 3. Recruit a small group (5–15 classmates)
- Share the link with a short note. It's unofficial, progress stays in their own browser, and they report problems through the repo's **Issues → New issue → Beta feedback** template. For testers without a GitHub account, add a short Google Form link or ask them to message you.
- Ask each tester for:
  1. one full Sprint, one Mock exam, and one Drill
  2. closing the site and coming back the next day to check that progress is still there
  3. any question whose answer they believe is wrong, with a screenshot
- Run it for about one week before the exam, while the material is fresh.

## 4. What to watch
| signal | where |
|---|---|
| bugs and wrong answers | Issues labelled `beta` |
| progress lost | tester reports. Ask which browser, and whether it was a private window or browsing data was cleared |
| layout problems | screenshots from phones |
| deploy failures | the Actions tab (a failing test blocks the deploy, so the live site stays on the last good version) |

## 5. Fixing during the beta
Edit `src/`, run `bash tests/run_all.sh`, and push to `main`. The site updates automatically after the checks pass. Log each fix in `docs/CHANGELOG.md`.

## Known limits to tell testers
- Progress lives in one browser. There's no sync, so use Export/Import to move it.
- Private/incognito windows and "clear browsing data" erase it.
- Safari may delete site data after about 7 days without a visit. A weekly Export is a cheap backup.
