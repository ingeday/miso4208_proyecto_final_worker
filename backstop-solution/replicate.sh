filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"

NEW_DIR=$filename
mkdir $NEW_DIR
mv $NEW_DIR.json $NEW_DIR/$NEW_DIR.json
mkdir $NEW_DIR/backstop_data
cd $NEW_DIR/backstop_data
ln -s ../../backstop-base/backstop_data/engine_scripts/ engine_scripts
cd ..
ln -s ../backstop-base/node_modules/ node_modules
cp ../backstop-base/get_report_names.js .
cp ../backstop-base/get_report_names.html .
cp ../backstop-base/configure_report.js .
