#!/usr/bin/env Rscript

#This code will need to recieve:
#1) Directory for data I/O operations
#2) Set of monthly weather data
#3) Model Parameters

#Activate Necessary Libraries
#library(MASS)

#Receive input from user, this should contain 1) working directory, 2) Lat Long, and 3) Model Parms
args <- commandArgs(TRUE)

directory <- args[1]

coefs <- coef_str

setwd("/home/austin/WebStuff/Images/")
setwd(directory)

## Extract simulated air temperature values for 2000-2080. 
### Projection of air temperature increase: DAILY
Stoc.Temp <- read.table("daily_stochastic_weather.txt", header=T)
Stoc.AveTemp <- (Stoc.Temp$TMIN+Stoc.Temp$TMAX)/2

## Use model to predict stream temperature values for 2000-2080
futureStrTemp <- as.data.frame(matrix(NA, nrow=length(Stoc.AveTemp), ncol=4))
names(futureStrTemp) <- c("WB","Jimmy","Mitchell","Obear")

for (i in 1:ncol(futureStrTemp)){
  futureStrTemp[,i] <- coefs[4,i]+(coefs[1,i]-coefs[4,i])/(1+exp((4*tan(coefs[3,i])/(coefs[1,i]-coefs[4,i]))*(coefs[2,i]-Stoc.AveTemp)))
}

futureStrTempFinal <- cbind(Stoc.Temp$YEAR, Stoc.Temp$MONTH, 
                            Stoc.Temp$DAY, futureStrTemp)
names(futureStrTempFinal) <- c("YEAR", "MONTH", "Day", "WB","Jimmy","Mitchell","Obear")

# save(futureStrTempFinal, file = "Future stream temp output.RData")
# write.table(futureStrTempFinal, file = "Future stream temp output.txt",
#             sep = ",", col.names = TRUE, qmethod = "double")
## "save" produces a smaller output file


########################################################################
## Calculating seasonal mean stream temperatures for population model ##
########################################################################
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "1"] <- "4"  # winter
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "2"] <- "4"
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "3"] <- "4"
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "4"] <- "1"  # spring
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "5"] <- "1"
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "6"] <- "2"  # summer
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "7"] <- "2"
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "8"] <- "2"
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "9"] <- "3"  # fall
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "10"] <- "3"
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "11"] <- "3"
futureStrTempFinal$Season[futureStrTempFinal$MONTH == "12"] <- "4"

agg <- list(futureStrTempFinal[,1],futureStrTempFinal[,8])
tmp <- aggregate(futureStrTempFinal[,4],agg,mean)
mon.final <- array(NA,c(length(tmp[,1]),4))

for (i in 1:4) {
agg <- list(futureStrTempFinal[,1],futureStrTempFinal[,8])
tmp <- aggregate(futureStrTempFinal[,i+3],agg,mean)
mon.final[,i] <- tmp[order(tmp$Group.1,tmp$Group.2),3]
}

agg <- list(futureStrTempFinal[,2])
mon.tmp <- aggregate(futureStrTempFinal[,4],agg,mean)
mon.hist <- c(1.542,1.692,3.445,7.662,11.941,14.951,16.094,15.722,13.736,10.070,5.558,2.249)

max.y <- max(mon.hist,mon.tmp[,2])+5

png(filename="StocStrTemp.png",width=725, height=575, bg="white")
plot(seq(from=1,to=12,by=1),mon.hist,col="black",type="b",pch=1,ylim=c(-5,max.y),main="Stream Temperature in Westbrook",ylab="Stream Temperature (C)",xlab="Month")
lines(seq(from=1,to=12,by=1),mon.tmp[,2],col="red")
dev.off()

write.table(cbind(tmp[order(tmp$Group.1,tmp$Group.2),1],tmp[order(tmp$Group.1,tmp$Group.2),2],round(mon.final,2)),"seasonal_streamtemp.txt",row.names=FALSE,col.names=FALSE,quote=FALSE)