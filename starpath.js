"use strict";

// Convert date to UTC Julian date
// Source: http://stackoverflow.com/a/11760079/500207
var getJulian = date => date.getTime() / 86400000 + 2440587.5;

var sind = deg => Math.sin(deg * Math.PI / 180);
var cosd = deg => Math.cos(deg * Math.PI / 180);
var asind = x => Math.asin(x) * 180 / Math.PI;
var mod = (a,b) => a % b;

// Source: http://www.mathworks.com/matlabcentral/fileexchange/26458
function RaDec2AzEl(Ra, Dec, lat, lon, dateObj) {
  var JD = getJulian(dateObj);
  var T_UT1 = (JD - 2451545) / 36525;
  var ThetaGMST = 67310.54841 + (876600 * 3600 + 8640184.812866) * T_UT1 +
                  0.093104 * Math.pow(T_UT1, 2) - 6.2e-6 * Math.pow(T_UT1, 3);
  ThetaGMST = mod(
      (mod(ThetaGMST, 86400 * (ThetaGMST / Math.abs(ThetaGMST))) / 240), 360);
  var ThetaLST = ThetaGMST + lon;

  var LHA = mod(ThetaLST - Ra, 360);

  var El = asind(sind(lat)*sind(Dec) + cosd(lat)*cosd(Dec)*cosd(LHA));

  var Az = mod(
      Math.atan2(-sind(LHA) * cosd(Dec) / cosd(El),
                 (sind(Dec) - sind(El) * sind(lat)) / (cosd(El) * cosd(lat))) *
          (180 / Math.PI),
      360);
  return {az : Az, el : El};
}

// http://www.geoastro.de/elevaz/basics/index.htm: az is 180 degrees off
var geo = RaDec2AzEl(55.8, 19.7, 50, 10,
                     new Date(Date.UTC(1991, 5 - 1, 19, 13, 0, 0)));

var hmsToDeg = (h, m, s) => (h + m / 60 + s / 3600) * (15 / 1);
var dmsToDeg = (d, m, s) => d + m / 60 + s / 3600;

var aldebaranCelestial = {
  ra : hmsToDeg(4, 35, 55.239),
    dec : dmsToDeg(16, 30, 33.49)
};
var beavercreekOhUsaLatLong = {
  lat : dmsToDeg(39, 43, 46),
    lon : -dmsToDeg(84, 3, 44)
};
// Agrees with Stellarium!
var me = RaDec2AzEl(aldebaranCelestial.ra, aldebaranCelestial.dec,
                    beavercreekOhUsaLatLong.lat, beavercreekOhUsaLatLong.lon,
                    new Date());
var meTime = d =>
    RaDec2AzEl(aldebaranCelestial.ra, aldebaranCelestial.dec,
               beavercreekOhUsaLatLong.lat, beavercreekOhUsaLatLong.lon, d);

// For plot
var now =  new Date();
var dateVec =
    _.range(2*60).map(h => new Date((new Date(now)).setMinutes(now.getMinutes() + h)));
var posVec = dateVec.map(meTime);

