rm(list=ls())
library(rjson)

#basedir<-"/home/ana/testing_dir_structure"
basedir<-"C:/ALR/GitHub/testing"

#load param/config functions, currently stored in the rscripts folder
rscriptdir<-paste0(basedir,"/rscripts")
setwd(rscriptdir)
source("param.functions.R")

#load param for this specific run
#eventually, info userid and runid will come from the webapp (javascript, etc) code 
#current file structure is base/runs/userid/runid
rundir<-paste0(basedir,"/runs/1234/1009")
setwd(rundir)
param<-fromJSON(file="settings.json")

#get the rscript from the param file.  then load the appropriate config file
setwd(rscriptdir)
config<-fromJSON(file=paste0(param$rscript,".json"))
paste0(param$rscript,".R")
source(paste0(param$rscript,".R"))

# Eventually, the following will be done server-side
# 
# -(load r libraries and param functions file?)
# -if new run, generate runid
# -create run directory in user's directory (name=runid)
# -write to param file in that run directory
#     -runid
#     -rscript
#     -userid
#     -basinid (if not basin "run")
#     -preceding run ids
#     
#     -all user settings from gui
# 

# -pass directly to R (json as argument?)
#     -runid
#     -rscript
#
# -using the rscript name, load the config file for that script/model
# -call R script to do the following checks (or do the checks in javascript?)
#     -param file has all required parameters (specified by config file)
#     -read in array of required previous model steps from config file
#     -read in array of preceding run ids from param file
#     -check that array of preceding runs contains one (and only one) run of each required preceding step
#        (as files are currently written, need to open param file for preceding runs, get rscript, 
#        then open config file for that rscript to determine which model step it is.  
#        should we add redundant info to simplify this?)
# 
# -finally (drumroll please) call rscript
# 
