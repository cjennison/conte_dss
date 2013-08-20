#Hargreaves Method
Hargreaves <- function(Tavg,Tdif,BasinLat,JulianDay,DaysInMonth) {
dr = (1+0.033*cos(2*pi/365*JulianDay))
phi = pi/180*BasinLat
delta = 0.409*sin((2*pi/365*JulianDay)-1.39)
ws = acos(-tan(phi)*tan(delta))
Rs = ((24*60/pi)*0.082*dr*(ws*sin(phi)*sin(delta)+cos(phi)*cos(delta)*sin(ws)))*0.408*DaysInMonth
PET = 0.0023*Rs*(Tavg+17.8)*sqrt(Tdif)
}