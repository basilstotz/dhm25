#!/bin/sh

curl https://cms.geo.admin.ch/ogd/topography/DHM25_MM_ASCII_GRID.zip > DHM25_MM_ASCII_GRID.zip
unzip DHM25_MM_ASCII_GRID.zip

mkdir -p lines
LINE=1;
while read -r x;do
    NAME=$( printf "%06i" $LINE )
    echo "$x" > lines/$NAME.txt
    LINE=$(( LINE + 1 ))
done < ASCII_GRID_1part/dhm25_grid_raster.asc


