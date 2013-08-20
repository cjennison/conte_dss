#!/usr/bin/env Rscript

#  basedir<-"C:/ALR/GitHub/testing"
basedir<-"/home/ana/testing"
setwd(paste0(basedir,"/rscripts"))
print(getwd())
print("start spatial data load")
source("spatial_data.R")
print("end spatial data load")
print("start spatial functions load")
source("spatial_functions.R")
print("start spatial functions load")


#args consists of single json object which contains lat and long coordinates, and an optional basin nickname
args<-fromJSON( commandArgs(trailingOnly = TRUE) )
# args<-list(lat=42.542331,long=-72.544681,nickname="saw_mill")
# args<-list(lat=42.353628,long=-72.614912)
# args<-list(lat=42.414712,long=-72.629807)
# args<-list(lat=42.359146,long=-72.503593,nickname="nice_basin")
# args<-list(lat=42.328188,long=-72.582815)
# args<-list(lat=42.270545,long=-72.596419)
{
   if (!is.null(args$nickname))
      getBasinfromLatLong(args$lat,args$long,basedir,nickname=args$nickname,output_type="both")
   else
      getBasinfromLatLong(args$lat,args$long,basedir,output_type="both")
}

#how do we pass the basin id back to javascript?

