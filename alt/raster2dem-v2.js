//https://digital-geography.com/news-from-vladimir-agafonkin-creator-of-leaflet/

function raster2dem(data, zFactor) {
 
    var v = new Uint16Array(256 * 256),
        dem = new Float32Array(256 * 256 * 2);
 
    var x, y, dx, dy, i, j;
 
    for (x = 0; x < 256; x++) {
        for (y = 0; y < 256; y++) {
            i = x + y * 256;
            j = i * 4;
            v[i] = data[j] + data[j + 1] * 2 + data[j + 2] * 3;
        }
    }
 
    for (x = 1; x < 255; x++) {
        for (y = 1; y < 255; y++) {
            i = y * 256 + x;
            dx = ((v[i - 255] + 2 * v[i + 1]   + v[i + 257]) - (v[i - 257] + 2 * v[i - 1]   + v[i + 255])) / 8;
            dy = ((v[i + 255] + 2 * v[i + 256] + v[i + 257]) - (v[i - 257] + 2 * v[i - 256] + v[i - 255])) / 8;

            j = (y * 256 + x) * 2;
            dem[j] = Math.atan(zFactor * Math.sqrt(dx * dx + dy * dy)); // slope
            dem[j + 1] = dx !== 0 ?
                Math.atan2(dy, -dx) :
                Math.PI / 2 * (dy > 0 ? 1 : -1); // aspect
        }
    }
 
    return dem;
}
