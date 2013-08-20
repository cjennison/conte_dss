
rm(list=ls())
library(rjson)

setwd("C:/ALR/GitHub/testing/rscripts")
config<-fromJSON(file="weather_generator.json")

setwd("C:/ALR/GitHub/testing/rscripts")
source("param.functions.R")


setwd("C:/ALR/GitHub/testing/rscripts")
config<-fromJSON(file="weather_generator.json")
setwd("C:/ALR/GitHub/testing/runs/1234/1009")
param<-fromJSON(file="settings.json")

req<-config$pre_step
pre<-parse.param("pre_run")

req
pre




pre
parse.param("userid")
parse.param("userid",values.only=F)
parse.param(c("userid","basinid"))
names(param)
names(config)






setwd("C:/ALR/WebAppCode/")
param.w.missing<-fromJSON(file="settings5.json")
param.no.missing<-fromJSON(file="settings4.json")

param<-param.w.missing
missing.param()

param<-param.no.missing
missing.param()










#parse config file to show all parameters with a specified setting, and the value for that setting
parse.config.setting("required")
parse.config.setting("default")
parse.config.setting("description")
parse.config.setting("min")

#find if the parameter.json file is missing any required parameters
missing.param(names(param.no.missing),parse.req(config))
missing.param(names(param.w.missing),parse.req(config))

#get the value from the parameter file
parse.param(param,c("runid","userid"))
parse.param(param,"lat")
parse.param(param,c("runid","userid","lat"))
#right now, if you ask for multiple param in the same function call, 
#this will convert all of them to data type of the first one listed
#i could do a workaround for that, but i imagine we'll mostly fetch one param at a time, 
#so i'll change it later if needed
parse.param(param,"typo")

parse.param(param,c("runid","userid"),values.only=F)
parse.param(param,"lat",values.only=T)
parse.param(param,"lat",values.only=F)

#write the values to a json file... maybe soon?
x<-toJSON(list( userid="3465346", runid=2653, nyears=30 ) )
x
write(x,"test_settings.json",sep="\n")
test<-fromJSON(file="test_settings.json")
test

y<-toJSON(list( userid=list(required=1), runid=list(required=1), nyears=list(required=0,default=30) ) )
y
y<-gsub("}","\\}",y)
y<-gsub("{","\\{",y)

#I haven't been able to get this to work, can't write to JSON w/ sub-groups, and then re-import it
write(y,"test_config.json",sep="\n")
config<-fromJSON("test_config.json")
#gets an error message
# Error in fromJSON("test_config.json") : 
#    parseTrue: expected to see 'true' - likely an unquoted string starting with 't'.
config<-fromJSON(y)
config
#this works, though




###
#
# Load the functions
#
###
###
#####
####
##
#

parse.config.setting<-function(config,setting) {
  #parses out any specified parameter from json object
  #returns array of names of required parameters
  config.setting<-data.frame(matrix(,ncol=2))
  names(config.setting)[[1]]<-"name"
  names(config.setting)[[2]]<-"value"
  row<-0
  for (i in 1:length(config)) {
    if( setting %in% names(config[i][[1]]) ) {
      row<-row+1
        #print( names(config[i]) )
      config.setting[row,"name"]<-names(config[i])
        #print(config[i][[1]][setting][[1]])
      config.setting[row,"value"]<-config[i][[1]][setting][[1]]
    }
  }
  return(config.setting)
}


parse.param<-function(param,param.name,values.only=T){
   return.param<-data.frame(matrix(,ncol=2))
   names(return.param)[[1]]<-"name"
   names(return.param)[[2]]<-"value"
   row<-0
   for (i in 1:length(param.name)) {
      if( param.name[i] %in% names(param) ) {
         row<-row+1
         return.param[row,"name"]<-param.name[i]
         return.param[row,"value"]<-param[param.name[i]][[1]]
      }
      else {
         print(paste("Parameter",param.name[i],"not found in parameter.json file."))
         return(NULL)
      }
   }
   if (values.only)      
      return(return.param$value)
   else
      return(return.param)
}

missing.param<-function(param,config) {
   req<-parse.config.setting(config,"required")
   req<-req[req$value==1,]
   #print(req)
   missing<-c()
   for(i in 1:nrow(req)) {
      if (!(req[i,"name"] %in% names(param)))
         missing<-c(missing,i)
   }
   if (length(missing)>0)
      return(req[missing,"name"])
   else
      return(NULL)
}
