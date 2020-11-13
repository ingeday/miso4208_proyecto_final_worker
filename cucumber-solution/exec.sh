filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"

NEW_DIR=$filename
cd $NEW_DIR
npm run test --publish > $NEW_DIR.results
