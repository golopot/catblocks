yarn pack-prod &&
cd dist-prod &&
git init &&
git add --all &&
git commit -m "Automated commit" &&
git push -f git@github.com:micha-cattree/micha-cattree.github.io.git master