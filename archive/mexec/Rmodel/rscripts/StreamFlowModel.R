#!/usr/bin/env Rscript

basedir <- paste0(getwd(), "/..") 
setwd(paste0(basedir,"/rscripts"))
source("param_startup.R")

#This code will need to recieve:
#1) Directory for data I/O operations
#2) Whether this is example (0) or other basin (1)
#3) Set of monthly weather data
#4) Basin Area in sq km


#Receive input from user, this should contain 1) working directory, 2) Example or User Basin, 3) Basin Area (km^2)
# args <- commandArgs(TRUE)

#Activate Libraries if needed
#library(zoo)

############How to Run Script from command line!########################################
#as a default, run this script with the following arguments: '/home/austin/temp/ 0 52' 

# directory <- "/home/austin/temp/"
# run_option <- 0

# #Set working directory for this instance/session
# directory <- args[1]
# run_option <- args[2]

# setwd("/home/node.js/rscripts/")
setwd(paste0(basedir,"/rscripts/"))
GCMDays <- read.table("Days_For_ABCDE_GCM.txt",header=TRUE)

#Read in weather generated from Climate Code
#setwd(directory)
setwd(pre_wd)

stoc.weather <- read.table("monthly_weather.txt",header=TRUE)
hist.weather <- read.table("h_monthly_weather.txt", header=TRUE)
s_calib_num <- length(stoc.weather$MONTH)
h_calib_num <- length(hist.weather$MONTH)

#Westbrook Example
if(run_option == 0){
basin_area <- 10.81
parameters <- c(0.934, 350.2514, 0.0000014, 0.62498, 0.4623, -0.7021, 9.9952) #SCE
#parameters <- c(0.965,300,0.15,0.8,0.4,-0.5,15) #Bayes eyeball
} else{
#basin_area <- args[3]
basin_area<-parse.param("basin_area")
###NEED TO FINISH
###Parameter Selection Part Will Go Here
parameters <- c(0.934, 350.2514, 0.0000014, 0.62498, 0.4623, -0.7021, 9.9952) #SCE
}


#Define state of ABCDE model
Sint <- 202.6 
Gint <- 73.4
Aint <- 28.3

###Define ABCDE model as a Function########################################3
ABCDE <- function(parameters,T,P,ET,Sint,Gint,Aint,calib_num) {
A <- array(0,calib_num)
S <- array(0,calib_num)
G <- array(0,calib_num)
y.hat <- array(0,calib_num)
Y <- array(0,calib_num)
W <- array(0,calib_num)
E <- array(0,calib_num)
mt <- array(0,calib_num)
Peff <- array(0,calib_num)
ETeff <- array(0,calib_num)
SNOW_FRAC <- array(0,calib_num)

a <- parameters[1]
b <- parameters[2]
c1 <- parameters[3]
d <- parameters[4]
e <- parameters[5]
f <- parameters[6]
dif <- parameters[7]

A[1] <- Aint
S[1] <- Sint
G[1] <- Gint
y.hat[1] <- 0
Y[1] <- 0
W[1] <- 0
E[1] <- 0
mt[1] <- 0
Peff[1] <- P[1]
ETeff[1] <- ET[1]

for (i in 2:calib_num){
#Snow Model
SNOW_FRAC[i] <- (f - T[i])/(dif)
if(T[i] >= (f-dif) && T[i] <= f){
mt[i] <- (A[i-1] + P[i]*SNOW_FRAC[i])*e*(1-SNOW_FRAC[i])
Peff[i] <- (P[i]*(1 - SNOW_FRAC[i]) + mt[i])
ETeff[i] <- 0
A[i] <- (A[i-1] + P[i]*SNOW_FRAC[i]) - mt[i]
} else if(T[i] > f) {
mt[i] <- A[i-1]
Peff[i] <- P[i]+mt[i]
ETeff[i] <- ET[i]
A[i] <- A[i-1] - mt[i]
} else {  #T[i] < (f-dif)
mt[i] <- 0
Peff[i] <- 0
ETeff[i] <- 0
A[i] <- A[i-1]+P[i]
}
#Begin ABCD Model
W[i] <- Peff[i] + S[i-1]
Y[i] <- (W[i]+b)/(2*a) - sqrt(((W[i]+b)/(2*a))^2-W[i]*b/a)
S[i] <- Y[i]*exp(-1*ETeff[i]/b)
E[i] <- Y[i]*(1-exp(-1*(ETeff[i]/b)))
G[i] <- (G[i-1] + c1*(W[i]-Y[i]))/(1+d)
y.hat[i] <- ((1-c1)*(W[i]-Y[i])+d*G[i])
}
return(y.hat)
}


###RUN the ABCDE Model Here##################################################################
stocflow <- ABCDE(parameters,stoc.weather$TAVG,stoc.weather$PRCP,stoc.weather$ET,Sint,Gint,Aint,s_calib_num)
histflow <- ABCDE(parameters,hist.weather$TAVG,hist.weather$PRCP,hist.weather$ET,Sint,Gint,Aint,h_calib_num)

#Define some conversion factors here
cfs_to_cmms <- 28316846.6 #this converts cubic feet per second to cubic millimeters per second
squaremi_to_sqmm <-  2589988110336 #this converts square miles to square millimeters
s_sec_to_month <- 86400*GCMDays$Days[613:1584] #this converts seconds to months
h_sec_to_month <- 86400*GCMDays$Days[1:744]

#we convert streamflow to mm
stocflow.cfs <- stocflow*1/cfs_to_cmms*(squaremi_to_sqmm)*1/s_sec_to_month*(basin_area)
histflow.cfs <- histflow*1/cfs_to_cmms*(squaremi_to_sqmm)*1/h_sec_to_month*(basin_area)

##Write out Monthly Streamflow TimeSeries
setwd(directory)
write.table(stocflow.cfs,"Stoc_Monthly_Streamflow.txt",row.names=FALSE,quote=FALSE,col.names=FALSE)
write.table(histflow.cfs,"Hist_Monthly_Streamflow.txt",row.names=FALSE,quote=FALSE,col.names=FALSE)

###Aggregate Streamflow to Seasonal Means for Fish Model
season.flow <- array(NA,c(972,4))
season.flow[,1] <- stoc.weather$MONTH
season.flow[,2] <- stoc.weather$YEAR
season.flow[,3] <- stocflow.cfs
season.flow[,4] <- seq(from=0,to=0,length=972)

loop.array <- array(0,c(12,2))
loop.array[,1] <- c(1,2,3,4,5,6,7,8,9,10,11,12)
loop.array[,2] <- c(4,4,4,1,1,2,2,2,3,3,3,4)

for (i in 1:12) {
season.flow[season.flow[,1] == loop.array[i,1],4] <- loop.array[i,2]  # winter
}

agg <-list(season.flow[,2],season.flow[,4])
tmp <- aggregate(season.flow,agg,mean)
seas.final <- cbind(tmp[order(tmp$Group.1,tmp$Group.2),1],tmp[order(tmp$Group.1,tmp$Group.2),2],tmp[order(tmp$Group.1,tmp$Group.2),5])
write.table(seas.final,"Seasonal_Streamflow.txt",row.names=FALSE,quote=FALSE,col.names=FALSE)

mon.stoc <- aggregate(stocflow.cfs,list(stoc.weather$MONTH),mean)
mon.hist <- aggregate(histflow.cfs,list(hist.weather$MONTH),mean)

max.y <- max(mon.hist,max(mon.stoc)+15)

#Make some graphics about Streamflow
png(filename="StocStrFlow.png",width=725, height=575, bg="white")
plot(seq(from=1,to=12,by=1),mon.hist[,2],col="black",type="b",pch=1,ylim=c(0,max.y),main="Streamflow",ylab="Streamflow (cfs)",xlab="Month")
lines(seq(from=1,to=12,by=1),mon.stoc[,2],col="red")
legend("topright", c("Stochastic/User Defined Climate", "Historic Climate"),col=c("red","black"),pch=c(-1,1),lwd=c(1,1),lty=c(1,1))
dev.off()