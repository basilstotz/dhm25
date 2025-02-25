#!/bin/bash

mkdir -p ASCII_GRID_1part/lines
LINE=1;
while read -r x;do
    NAME=$( printf "%06i" $LINE )
    echo "$x" > ASCII_GRID_1part/$NAME.txt
    LINE=$(( LINE + 1 ))
done < ASCII_GRID_1part/dhm25_grid_raster.asc


