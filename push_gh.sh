thispwd=`pwd`

if [ -d "/tmp/catblocks" ]; then
	cd /tmp/catblocks
	git checkout gh-pages
	git fetch
else
	git clone -b gh-pages https://github.com/q4w56/catblocks.git /tmp/catblocks --depth=1
fi

mkdir -p /tmp/catblocks/1
cp -r $thispwd/dist/* /tmp/catblocks/1 &&
cd /tmp/catblocks	&&
git add --all
git commit -m 'automated commit'
git push origin gh-pages

