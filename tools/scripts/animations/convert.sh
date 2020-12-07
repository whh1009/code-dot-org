# Usage:
#   bash image2urijpeg.sh image.jpg 320x240 > base64.txt  # will resize before conversion
#   bash image2urijpeg.sh image.jpg > base64.txt          # will keep original size
rm sprites.tsv
touch sprites.tsv
find "./UI/Buttons/Button-30.png" -name *.png -print0 | while read -d $'\0' file
do
    echo "Converting $file"
    echo -en "$file\t" >> sprites.tsv
    echo $(magick $file -resize 64x64 jpeg:- | openssl enc -base64 -A | sed -e 's/^/data:image\/jpeg;base64,/') >> sprites.tsv
done
