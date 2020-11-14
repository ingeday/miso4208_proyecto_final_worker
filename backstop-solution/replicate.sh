filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"

NEW_DIR=$filename
mkdir ./backstop-solution/$NEW_DIR
mv ./backstop-solution/$NEW_DIR.json ./backstop-solution/$NEW_DIR/$NEW_DIR.json
mkdir ./backstop-solution/$NEW_DIR/backstop_data
cd ./backstop-solution/$NEW_DIR/backstop_data
ln -s ../../backstop-base/backstop_data/engine_scripts/ engine_scripts
cd ..
ln -s ../../node_modules/ node_modules
cp ../backstop-base/get_report_names.js .
cp ../backstop-base/get_report_names.html .
cp ../backstop-base/configure_report.js .
