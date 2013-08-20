#!/usr/bin/env Rscript

#This code will need to recieve:
#1) Directory for data I/O operations
#2) Option indicating Westbrook Example (0) or Any Basin (1)
#3) Three arguments for changes to: 1) mean prcp, 2) var prcp, and 3)mean temp
#4) Basin Coordinates
#This script recieves them from the website as whole numbers that are divided to create percentages that are them added to one for the prcp, and
#as a whole number for mean temp change

############How to Run Script from command line!########################################
#as a default, run this script with the following arguments: '/home/austin/temp/ 0 0 0 0 -72.733087 42.394229' 

#Activate Necessary Libraries
library(MASS)

#Receive input from user, this should contain 1) working directory, 2) Lat Long, and 3) Model Parms
args <- commandArgs(TRUE)
directory <- args[1]
run_option <- as.numeric(args[2])
mean_prcp_change_percent <- 1 + as.numeric(args[3])/100
var_prcp_change_percent <- 1 + as.numeric(args[4])/100
mean_temp_change_celsius <- as.numeric(args[5])
metdata <- "/home/austin/DailyMets/"

#Use these to test script actually working
#directory <- "/home/austin/temp/"
#run_option <- 0
#mean_prcp_change_percent <- 1
#var_prcp_change_percent <- 1
#mean_temp_change_celsius <- 0
#metdata <- "/home/austin/DailyMets/"

#Stochastoc Weather Generator Options - These could be allowed to change later
num_year_sim <- 81 
thresh <- 0    #0 mm is threshold for a day to be considered as rain

##########################################################################################################################################################################################

#Here we need to do some work regarding whether the option is for Westbrook or for any basin...
#If westbrook is chosen then read in predefined data
#Else read in list of coords encompassed by user defined basin
if (run_option == 0) {
basin_coords <- c(-72.733087,42.394229)
setwd(metdata)
filenames <- "data_42.4375_-72.6875"
num_site <- 1
DATA <- read.table(filenames,header=FALSE)
setwd(directory)
} else {
basin_coords <- c(args[6],args[7])
setwd(directory)
filenames <- read.table("coords_list.txt")
num_site <- length(filenames)
DATA <- read.table(filenames[1],header=FALSE)
}

setwd(metdata)
SITE_PRCP <- array(NA,c(dim(DATA)[1],num_site))
SITE_TMAX <- array(NA,c(dim(DATA)[1],num_site))
SITE_TMIN <- array(NA,c(dim(DATA)[1],num_site))
SITE_TEMP <- array(NA,c(dim(DATA)[1],num_site))
SITE_WIND <- array(NA,c(dim(DATA)[1],num_site))

for (i in 1:num_site) {	
	CUR_SITE_DATA <- read.table(filenames[i],header=FALSE)
	SITE_PRCP[,i] <- CUR_SITE_DATA[,4]
	SITE_TMAX[,i] <- CUR_SITE_DATA[,5]
	SITE_TMIN[,i] <- CUR_SITE_DATA[,6]
	SITE_TEMP[,i] <- (CUR_SITE_DATA[,5] +  CUR_SITE_DATA[,6])/2
	SITE_WIND[,i] <- CUR_SITE_DATA[,7]	
}

DATA[,4] <- apply(SITE_PRCP,1,median)
DATA[,5] <- apply(SITE_TMAX,1,mean)
DATA[,6] <- apply(SITE_TMIN,1,mean)
DATA[,7] <- apply(SITE_WIND,1,mean)

colnames(DATA) <- c("YEAR","MONTH","DAY","PRCP","TMAX","TMIN","WIND")

YEAR <- DATA[,1]
MONTH <- DATA[,2]
DAY <- DATA[,3]
DATE <- as.Date(paste(YEAR,"-",MONTH,"-",DAY,sep=""))
MONTH_DAY <- cbind(MONTH,DAY)
PRCP <- DATA[,4]
TMAX <- DATA[,5]
TMIN <- DATA[,6]
TEMP <- (TMAX + TMIN)/2

##########################################################################################################################################################################################
KNN <- function(cur_sim_PRCP,cur_sim_TEMP,PRCP_TODAY,TEMP_TODAY,PRCP_TOMORROW,TEMP_TOMORROW,TMAX_TOMORROW,TMIN_TOMORROW,DATE_TOMORROW,k,mean_monthly_PRCP,mean_monthly_TEMP) {
	w_PRCP <- 4/mean_monthly_PRCP
	w_TEMP <- 0/mean_monthly_TEMP
	var_order <- 1:length(PRCP_TODAY)
	distance <- sqrt(w_PRCP*(cur_sim_PRCP - PRCP_TODAY)^2 + w_TEMP*(cur_sim_TEMP - TEMP_TODAY)^2)
	ordered_distances <- matrix(cbind(var_order,distance)[order(distance),],ncol=2)
	K_Distances <- matrix(ordered_distances[1:k,],ncol=2)
	PROBS <- (1/row(K_Distances)[,1]) / sum((1/row(K_Distances)[,1]))
	selection <- sample(row(K_Distances)[,1],size=1,prob=PROBS,replace=TRUE)
	FINAL_PRCP <- PRCP_TOMORROW[K_Distances[selection,1]]
	FINAL_TEMP <- TEMP_TOMORROW[K_Distances[selection,1]]
	FINAL_TMAX <- TMAX_TOMORROW[K_Distances[selection,1]]
	FINAL_TMIN <- TMIN_TOMORROW[K_Distances[selection,1]]
	FINAL_DATE <- DATE_TOMORROW[K_Distances[selection,1]]
	return(c(FINAL_PRCP,FINAL_TEMP,FINAL_TMAX,FINAL_TMIN,FINAL_DATE))
}
##########################################################################################################################################################################################


###############################################################GET REGIONAL TRANSITION PROBABILITIES############################################################################################
PRCP_LAG0 <- PRCP[2:length(PRCP)]
PRCP_LAG1 <- PRCP[1:(length(PRCP)-1)]
MONTH_LAG0 <- MONTH[2:length(PRCP)]
MONTH_LAG1 <- MONTH[1:(length(PRCP)-1)]
p01 <- array(NA,12)
p11 <- array(NA,12)

for (m in 1:12) {
		x <- which(MONTH_LAG1==m)
		CUR_PRCP0 <- PRCP_LAG0[x]
		CUR_PRCP1 <- PRCP_LAG1[x]
		p01[m] <- length(which(PRCP_LAG1[x]<=thresh & PRCP_LAG0[x]>thresh)) / length(which(PRCP_LAG1[x]<=thresh))
		p11[m] <- length(which(PRCP_LAG1[x]>thresh & PRCP_LAG0[x]>thresh)) / length(which(PRCP_LAG1[x]>thresh))
} 
######################################################################################################################################################################

###################################################################################STOCHASTIC SIMULATION###############################################################
START_YEAR_SIM <- 2000
END_YEAR_SIM <- START_YEAR_SIM + num_year_sim - 1
DATE_SIM <- seq(as.Date(paste(START_YEAR_SIM,"-01-01",sep="")),as.Date(paste(END_YEAR_SIM,"-12-31",sep="")),by="day")
DAY_SIM <- as.numeric(format(DATE_SIM,"%d"))
MONTH_SIM <- as.numeric(format(DATE_SIM,"%m"))
YEAR_SIM <- as.numeric(format(DATE_SIM,"%Y"))
SIM_LENGTH <- length(DATE_SIM)
OCCURENCES <- array(0,c(SIM_LENGTH))
SIM_PRCP <- array(0,c(SIM_LENGTH))
SIM_TEMP <- array(25,c(SIM_LENGTH))     
SIM_TMAX <- array(30,c(SIM_LENGTH))     
SIM_TMIN <- array(20,c(SIM_LENGTH))     
SIM_DATE <- array(as.Date("1980-01-01"),c(SIM_LENGTH))     #we start simulated temperature at mean January temperature

#MARKOV CHAIN
count <- 1
for (j in 1:SIM_LENGTH) {
	m <- MONTH_SIM[j]
	count <- count + 1
	if (count <=SIM_LENGTH) {
		rn <- runif(1,0,1)
		if (OCCURENCES[(count-1)]==0) {pp <- p01[m]}
		if (OCCURENCES[(count-1)]==1) {pp <- p11[m]}
		if(rn <= pp) {
			OCCURENCES[count] <- 1
		} else {
			OCCURENCES[count] <- 0
		}
	}
}
OCCURENCES[1] <- 0    #ensure first day is marked dry, which will align with first prcp ammount as 0

count <- 1
for (j in 1:SIM_LENGTH) {
	m <- MONTH_SIM[j]
	d <- DAY_SIM[j]
	if (count < SIM_LENGTH) {
		cur_OCCERENCE <- OCCURENCES[count]
		next_OCCURENCE <- OCCURENCES[(count+1)]
	
		cur_day <- which(MONTH_DAY[,1]==m & MONTH_DAY[,2]==d)
		cur_day <- c((cur_day-3),(cur_day-2),(cur_day-1),cur_day,(cur_day+1),(cur_day+2),(cur_day+3))
		cur_day <- subset(cur_day,cur_day > 0)
				
		if (cur_OCCERENCE==0 & next_OCCURENCE==0) {cur_day_cur_state <- which(PRCP[cur_day]<=thresh & PRCP[(cur_day+1)]<=thresh)}
		if (cur_OCCERENCE==1 & next_OCCURENCE==0) {cur_day_cur_state <- which(PRCP[cur_day]>thresh & PRCP[(cur_day+1)]<=thresh)}
		if (cur_OCCERENCE==0 & next_OCCURENCE==1) {cur_day_cur_state <- which(PRCP[cur_day]<=thresh & PRCP[(cur_day+1)]>thresh)}
		if (cur_OCCERENCE==1 & next_OCCURENCE==1) {cur_day_cur_state <- which(PRCP[cur_day]>thresh & PRCP[(cur_day+1)]>thresh)}
			
		possible_days <- cur_day[cur_day_cur_state]
		PRCP_TODAY <- PRCP[possible_days]
		TEMP_TODAY <- TEMP[possible_days]
		PRCP_TOMORROW <- PRCP[possible_days+1]
		TEMP_TOMORROW <- TEMP[possible_days+1]
		TMAX_TOMORROW <- TMAX[possible_days+1]
		TMIN_TOMORROW <- TMIN[possible_days+1]
		DATE_TOMORROW <- DATE[possible_days+1]

		cur_sim_PRCP <- SIM_PRCP[count]
		cur_sim_TEMP <- SIM_TEMP[count]
					
		mm <- which(MONTH==m)
		mean_monthly_TEMP <- mean(TEMP[mm],na.rm=TRUE)
		mean_monthly_PRCP <- mean(PRCP[mm],na.rm=TRUE)
	
		k <- round(sqrt(length(possible_days)))
		RESULT <- KNN(cur_sim_PRCP,cur_sim_TEMP,PRCP_TODAY,TEMP_TODAY,PRCP_TOMORROW,TEMP_TOMORROW,TMAX_TOMORROW,TMIN_TOMORROW,DATE_TOMORROW,k,mean_monthly_PRCP,mean_monthly_TEMP)

		SIM_PRCP[(count+1)] <- RESULT[1]
		SIM_TEMP[(count+1)] <- RESULT[2]
		SIM_TMAX[(count+1)] <- RESULT[3]
		SIM_TMIN[(count+1)] <- RESULT[4]
		SIM_DATE[(count+1)] <- as.Date(RESULT[5],origin="1970-01-01")
					
		count <- count+1
	}
}

###########################################################################################################################################################################
############################################################################TIME SERIES ADJUSTMENTS########################################################################

#temperature adjustment
SIM_TEMP_ADJUSTED <- SIM_TEMP + mean_temp_change_celsius
SIM_TMIN_ADJUSTED <- SIM_TMIN + mean_temp_change_celsius
SIM_TMAX_ADJUSTED <- SIM_TMAX + mean_temp_change_celsius


#precipitation adjustment
probs <- seq(0.001,.999,by=0.001)
parameters <- array(NA,c(12,2))
ratios <- array(NA,c(length(probs),12))
prcp_distr <- array(NA,c(length(probs),12))
prcp_distr2 <- array(NA,c(length(probs),12))

for (m in 1:12) {
	a <- which(MONTH==m & PRCP>thresh)
	dist1 <- fitdistr(PRCP[a],"gamma")
	parameters[m,] <- c(dist1$estimate[[1]],dist1$estimate[[2]])
	prcp_distr[,m] <- qgamma(probs,shape=dist1$estimate[[1]], rate = dist1$estimate[[2]])
	shp2 <- (mean_prcp_change_percent)^2*dist1$estimate[[1]]/var_prcp_change_percent
	rate2 <- mean_prcp_change_percent*dist1$estimate[[2]]/var_prcp_change_percent
	prcp_distr2[,m] <- qgamma(probs,shape=shp2, rate = rate2)
	ratios[,m] <- prcp_distr2[,m]/prcp_distr[,m]
}

SIM_PRCP_ADJUSTED <- SIM_PRCP
for(m in 1:12) {
	w <- which(SIM_PRCP>thresh & MONTH_SIM==m)
	for (j in 1:length(w)) {		
		multiplier <- approx(prcp_distr[,m],ratios[,m],SIM_PRCP[w[j]])$y
		if (is.na(multiplier)==TRUE) {multiplier <- 1}
		SIM_PRCP_ADJUSTED[w[j]] <- multiplier*SIM_PRCP[w[j]]
	}
}


#######################################################Do Aggregating of Met Data and Create ET####################################################################
setwd("/home/node.js/rscripts/")
source("Hargreaves.R") #This generates ET values and may get moved to the met section
GCMDays <- read.table("Days_For_ABCDE_GCM.txt",header=TRUE)

FINAL_STOCHASTIC_DAILY <- cbind(YEAR_SIM,MONTH_SIM,DAY_SIM,round(SIM_PRCP_ADJUSTED,2),round(SIM_TMAX_ADJUSTED,2),round(SIM_TMIN_ADJUSTED,2),round(SIM_TEMP_ADJUSTED,2))
FINAL_STOCHASTIC_MONTHLY1 <- aggregate(FINAL_STOCHASTIC_DAILY[,c(1:2,5:7)],FUN=mean,by=list(FINAL_STOCHASTIC_DAILY[,2],FINAL_STOCHASTIC_DAILY[,1]))[,3:7]
FINAL_STOCHASTIC_MONTHLY2 <- aggregate(FINAL_STOCHASTIC_DAILY[,4],FUN=sum,by=list(FINAL_STOCHASTIC_DAILY[,2],FINAL_STOCHASTIC_DAILY[,1]))[,3]
FINAL_HISTORIC_MONTHLY1 <- aggregate(DATA[,c(1:2,5:6)],FUN=mean,by=list(DATA[,2],DATA[,1]))[,c(1:2,5:6)]
FINAL_HISTORIC_MONTHLY2 <- aggregate(DATA[,c(1:2,4)],FUN=sum,by=list(DATA[,2], DATA[,1]))[,5]
HTAVG <- (FINAL_HISTORIC_MONTHLY1[,3]+FINAL_HISTORIC_MONTHLY1[,4])/2

FINAL_STOCHASTIC_MONTH1 <- aggregate(FINAL_STOCHASTIC_DAILY[,c(1:2,5:7)],FUN=mean,by=list(FINAL_STOCHASTIC_DAILY[,2]))[,c(1,4:6)]
FINAL_STOCHASTIC_MONTH2 <- aggregate(FINAL_STOCHASTIC_DAILY[,4],FUN=sum,by=list(FINAL_STOCHASTIC_DAILY[,2]))[,2]/num_year_sim

HIST_TEMP_MONTH <- aggregate(DATA[,c(1:2,5:6)],FUN=mean,by=list(DATA[,2]))[4:5]
FINAL_HISTORIC_MONTH1 <- (HIST_TEMP_MONTH$TMAX+HIST_TEMP_MONTH$TMIN)/2
FINAL_HISTORIC_MONTH2 <- aggregate(DATA[,c(1:2,4)],FUN=sum,by=list(DATA[,2]))[,4]/62 #62 years in historic timeseries

SDIF <- FINAL_STOCHASTIC_MONTHLY1[,3]-FINAL_STOCHASTIC_MONTHLY1[,4]
HDIF <- FINAL_HISTORIC_MONTHLY1[,3]-FINAL_HISTORIC_MONTHLY1[,4]
STOC_ET <- Hargreaves(FINAL_STOCHASTIC_MONTHLY1[,5],SDIF,basin_coords[2],GCMDays$Jday[613:1584],GCMDays$Days[613:1584])
HIST_ET <- Hargreaves(HTAVG,HDIF,basin_coords[2],GCMDays$Jday[1:744],GCMDays$Days[1:744])

FINAL_STOCHASTIC_MONTHLY <- cbind(FINAL_STOCHASTIC_MONTHLY1[,1:2],round(FINAL_STOCHASTIC_MONTHLY2,2),round(FINAL_STOCHASTIC_MONTHLY1[,3:5],2),round(STOC_ET,2),round(SDIF,2))
FINAL_STOCHASTIC_MONTH <- cbind(FINAL_STOCHASTIC_MONTH1[,1],round(FINAL_STOCHASTIC_MONTH2,2),round(FINAL_STOCHASTIC_MONTH1[,2:4],2))
FINAL_HISTORIC_MONTHLY <- cbind(FINAL_HISTORIC_MONTHLY1[,2],FINAL_HISTORIC_MONTHLY1[,1],round(FINAL_HISTORIC_MONTHLY2,2),round(FINAL_HISTORIC_MONTHLY1[,3:4],2),round(HTAVG,2),round(HIST_ET,2),round(HDIF,2))
FINAL_HISTORIC_MONTH <- cbind(FINAL_STOCHASTIC_MONTH1[,1],round(FINAL_HISTORIC_MONTH2,2),round(FINAL_HISTORIC_MONTH1,2))

colnames(FINAL_STOCHASTIC_DAILY) <- c("YEAR","MONTH","DAY","PRCP","TMAX","TMIN","TAVG")
colnames(FINAL_STOCHASTIC_MONTHLY) <- c("YEAR","MONTH","PRCP","TMAX","TMIN","TAVG","ET","DIF")
colnames(FINAL_STOCHASTIC_MONTH) <- c("MONTH","PRCP","TMAX","TMIN","TAVG")
colnames(FINAL_HISTORIC_MONTHLY) <- c("YEAR","MONTH","PRCP","TMAX","TMIN","TAVG","ET","DIF")
colnames(FINAL_HISTORIC_MONTH) <- c("MONTH","PRCP","TAVG")

##################################################################################################################################################
##Set directory to current working directory and write stuff out
setwd(directory)

write.table(FINAL_STOCHASTIC_DAILY,"daily_weather.txt",row.names=FALSE,quote=FALSE) #This is the daily timeseries
write.table(FINAL_STOCHASTIC_MONTHLY,"monthly_weather.txt",row.names=FALSE,quote=FALSE) #This is the mean monthly timeseries
write.table(FINAL_STOCHASTIC_MONTH,"month_weather.txt",row.names=FALSE,quote=FALSE,col.names=TRUE) # this is the mean month average
write.table(FINAL_HISTORIC_MONTHLY,"h_monthly_weather.txt",row.names=FALSE,quote=FALSE,col.names=TRUE) # this is the mean monthly timeseries
write.table(FINAL_HISTORIC_MONTH,"h_month_weather.txt",row.names=FALSE,quote=FALSE,col.names=TRUE) # this is the mean monthly average


###Make some images if necessary
max.y.p <- max(FINAL_HISTORIC_MONTH[,2],FINAL_STOCHASTIC_MONTH$PRCP)+25
min.y.p <- min(FINAL_HISTORIC_MONTH[,2],FINAL_STOCHASTIC_MONTH$PRCP)-25
max.y.t <- max(FINAL_HISTORIC_MONTH[,3],FINAL_STOCHASTIC_MONTH$TAVG)+5
min.y.t <- min(FINAL_HISTORIC_MONTH[,3],FINAL_STOCHASTIC_MONTH$TAVG)-5

##Create a image for website
png(filename="StocWeather.png",width=725, height=575, bg="white")
op <- par(mfrow=c(2,1))
plot(FINAL_STOCHASTIC_MONTH$MONTH,FINAL_STOCHASTIC_MONTH$PRCP,col="red",type="b",pch=1,ylim=c(min.y.p,max.y.p),ylab="Precipitation (mm)",xlab="Month",main="Mean Stochastic Weather - Precipitation")
lines(FINAL_HISTORIC_MONTH[,1],FINAL_HISTORIC_MONTH[,2],col="black")
legend("topright", c("Stochastic/User Defined Climate", "Historic Climate"),col=c("red","black"),pch=c(-1,1),lwd=c(1,1),lty=c(1,1))
plot(FINAL_STOCHASTIC_MONTH$MONTH,FINAL_STOCHASTIC_MONTH$TAVG,col="red",type="b",pch=1,ylim=c(min.y.t,max.y.t),ylab="Temperature (C)",xlab="Month",main="Mean Stochastic Weather - Temperature")
lines(FINAL_HISTORIC_MONTH[,1],FINAL_HISTORIC_MONTH[,3],col="black")
legend("topright", c("Stochastic/User Defined Climate", "Historic Climate"),col=c("red","black"),pch=c(-1,1),lwd=c(1,1),lty=c(1,1))
par(op)
dev.off()
