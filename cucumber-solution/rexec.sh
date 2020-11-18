# rexec = Replicate and Execute
echo "Replicating Cucumber environment for" $1
cd ./cucumber-solution/
./replicate.sh $1.zip
echo "Executing Cucumber for" $1
./exec.sh $1
echo "Preparing Cucumber Report for" $1
sed '2d' ./$1/$1.results > ./$1/$1.results.tmp
rm -rf ./$1/$1.results
mv ./$1/$1.results.tmp ./$1/$1.results
cat $1/$1.results
echo "Publishing Cucumber report for '$1' on the frontend component"
cp -R $1/$1.results ./../../frontend/reports/cucumber/$1.results.txt
