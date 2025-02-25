#!/bin/bash

mkdir -p lines
LINE=1;
while read -r x;do
    NAME=$( printf "%06i" $LINE )
    echo "$x" > lines/$NAME.txt
    LINE=$(( LINE + 1 ))
done < ASCII_GRID_1part/dhm25_grid_raster.asc


