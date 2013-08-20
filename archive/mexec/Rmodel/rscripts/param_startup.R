library(rjson)
print("in param_starup.r")
basedir <- paste0(getwd(), "/..")
setwd(paste0(basedir,"/rscripts"))
source("param_functions.R")


#args consists of single json object which contains userid and runid
ids<-fromJSON(commandArgs(trailingOnly = TRUE) )
#these ids are used to find correct directory for the run, which contains param.json, which has all remaining parameters

setwd(paste0(basedir,"/runs/",ids$userid,"/",ids$runid))
param<-fromJSON(file="param.json")

setwd(paste0(basedir,"/rscripts"))
config<-fromJSON(file=paste0(param$rscript,".json"))

directory<-paste0( basedir,parse.wd() )
# print.to.test(directory)

#Westbrook Example (0)
# Any Basin (1)
{
	if (parse.param("basinid")=="west_brook")
	   run_option <-0
	else
	   run_option <-1
}


pre_wd<-paste0( basedir,parse.pre.wd() )