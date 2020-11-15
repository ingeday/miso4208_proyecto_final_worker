filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"

NEW_DIR=$filename
mkdir $NEW_DIR
mv $NEW_DIR.zip $NEW_DIR/$NEW_DIR.zip
cd $NEW_DIR
ln -s ../cucumber-base/node_modules/ node_modules
ln -s ../cucumber-base/package-lock.json package-lock.json
ln -s ../cucumber-base/package.json package.json
tar -xvf $NEW_DIR.zip
rm $NEW_DIR.zip
