#!/usr/bin/env Rscript

library(sp)
library(rgdal)
library(rgeos)
library(maptools)     


# Load NHDplus Data

##
##
#####
####
###
##
#

olddir<-getwd()
# Base directory (change depending on file structure wherever this is being run)
# basedir<-"C:/ALR/SpatialData"
basedir<-"/home/node.js/data/nhd"
setwd(basedir)
#basedir<-"C:/Documents/__USGS"

##### Define projections
# Projection used by NHD and NHDplus
proj4.NHD<-"+proj=longlat +ellps=GRS80 +datum=NAD83 +no_defs"
#Projection used by NHDplus for gridded data
# proj4.NHDplusgrid
# Projection used by MassGIS
# proj4.MAstateplane<-"+proj=lcc +lat_1=41.71666666666667 +lat_2=42.68333333333333 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000 +ellps=GRS80 +units=m +no_defs"


### load NHDPlus shapefiles and attribute dbf files
#Flowlines
#setwd(paste0(basedir,"/NHDPlus/NHDPlusV21_NE_01_NHDSnapshot_01/NHDPlusNE/NHDPlus01/NHDSnapshot/Hydrography"))
NEFlow.line<-readShapeLines("NHDFlowline",proj4string=CRS(proj4.NHD))

#Catchments
#setwd(paste0(basedir,"/NHDplus/NHDPlusV21_NE_01_NHDPlusCatchment_01/NHDPlusNE/NHDPlus01/NHDPlusCatchment"))
NECatch.shape<-readShapePoly("Catchment",proj4string=CRS(proj4.NHD))

#Attributes tables
#setwd(paste0(basedir,"/NHDplus/NHDPlusV21_NE_01_NHDPlusAttributes_01/NHDPlusNE/NHDPlus01/NHDPlusAttributes"))
plusflow<-read.dbf("PlusFlow.dbf")
plusflowlineVAA<-read.dbf("PlusFlowlineVAA.dbf")

### Merge w/ VAA table to get attributes
plusdata<-plusflowlineVAA[,c(1,4,1)]
bkup<-NEFlow.line
NEFlow.line@data[c(1:nrow(NEFlow.line@data)),ncol(NEFlow.line)+1]<-c(1:nrow(NEFlow.line@data)) #add column to sort by later
colnames(NEFlow.line@data)[15]<-"sortby"
NEFlow.line@data<-merge(NEFlow.line, plusdata, by.x="COMID", by.y="ComID", all.x=TRUE, sort=FALSE)
NEFlow.line@data<-NEFlow.line@data[order(NEFlow.line$sortby),] 
rm(list=c("plusdata"))

NHDFlow.line<-NEFlow.line
NHDCatch.shape<-NECatch.shape


   ### Create a subset of NHDplus flowlines/features
   ### lower CT R basin only, just to save time
#   lowCTFlow.line<-NEFlow.line[substr(NEFlow.line$REACHCODE,1,6)=="010802",] #HUC6
#   lowCTCatch.shape<-NECatch.shape[NECatch.shape$FEATUREID %in% lowCTFlow.line$COMID,]

   
   ### The NHDFlow.line and NHDCatch.shape will be used throughout the code
   ### Here, decide whether these should point to the full set of catchments/flowlines 
   ### for the New England region, or for a subsection of the Lower CT R basin
#   NHDFlow.line<-lowCTFlow.line
#   NHDCatch.shape<-lowCTCatch.shape



setwd(olddir)