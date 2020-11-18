# rrt = Replicate and Reference and Test
echo "Replicating Backstop environment for " $1
./backstop-solution/replicate.sh $1
echo "Taking snapshots for the 'URL' reference"
./backstop-solution/backstop.sh reference $2
echo "Taking snapshots for the 'URL' "
./backstop-solution/backstop.sh test $2
echo "Preparing Report Files"
cp -R ./backstop-solution/$2/ ./../frontend/reports/backstopjs/$2
echo "Backstop into TTM has been executed success!"
echo "Visit report here http://localhost:3000/reports/backstopjs/$2/backstop_data/html_report/"

