ECHO "[COMPILING]"
cd ..
ECHO "....... index.js"
uglifyjs index.js -o minify/nosql/index.js

cp readme.md minify/nosql/readme.md
cp package.json minify/nosql/package.json
cp license.txt minify/nosql/license.txt

cd minify
node minify.js