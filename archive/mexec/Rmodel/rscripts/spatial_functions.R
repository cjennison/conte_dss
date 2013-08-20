#!/usr/bin/env Rscript

library(sp)
library(rgdal)
library(rgeos)
library(maptools)     
library(rjson)


# Load Basin Deliniation Functions

##
##
#####
####
###
##
#

getBasinfromComID<-function(featureID,basedir,output_type="kml",nickname="") {
   ### defines basin from user-chosen
   ### NHDplus stream feature or catchment 
   ### (stream feature's ComID == catchment's FeatureID)
   savedwd<-getwd()
   setwd(paste0(basedir,"/basins/"))
   if (file.exists(as.character(featureID))) {
      setwd(savedwd)
      return(toJSON(list(featureID=featureID)))
   }

   dir.create(as.character(featureID))
   setwd(paste0(basedir,"/basins/",featureID))            
   
   ### creates shapefiles and kml files of basin outline and streams & catchments it contains
   if (plusflowlineVAA$StreamOrde[plusflowlineVAA$ComID==featureID] >= 6) {
      message("Please choose a smaller stream or tributary")
      setwd(savedwd)
      return(NULL)
   }
   if (plusflowlineVAA$StreamOrde[plusflowlineVAA$ComID==featureID] == 1) {
      message("Please choose a larger stream or tributary")
      setwd(savedwd)
      return(NULL)
   }
   #else {
   #iteratively select all features upstream of user chosen feature
   segments<-c() #list of flowline segments to save
   queue<-c(featureID) #queue of flowline segments that need to be traced upstream                 
   
   while (length(queue)>0) {
      if(queue[1]==0) {
         queue<-queue[-1] #discard 1st element in the queue if it's a zero
         #in the NHDplus tables, features with FROMCOMID==0 have no inflowing tribs
      }
      else {
         segments<-c(segments,queue[1]) #add 1st element to the saved segments
         queue<-c(queue[-1],plusflow[plusflow$TOCOMID==queue[1],]$FROMCOMID) #remove 1st segment from the queue, 
         #add all segments that flow into it to the queue
      }
   }
   
   #collect all stream segments in upstream network
   stream.line<-NHDFlow.line[NHDFlow.line$COMID %in% segments,]
   #collect all catchments around upstream network
   catchment.shape<-NHDCatch.shape[NHDCatch.shape$FEATUREID %in% segments,]
   #dissolve border for basin outline
   basin.shape<-gUnaryUnion(catchment.shape)
   #get centroid to write to param file
   centroid<-gCentroid(basin.shape, byid=FALSE, id = NULL)
   #turn outline into spatial dataframe again to enable output as shapefile/kml
   basin.shape<-SpatialPolygonsDataFrame(basin.shape,data=data.frame(StartFID=featureID,row.names=NULL),match.ID=FALSE)
   
   
   #export spatial files of basin outline and flowlines
   if (output_type=="kml" | output_type=="both") {         
      writeOGR(basin.shape,  "BasinOutline.kml", layer="BasinOutline", driver="KML",dataset_options=c("NameField=FEATUREID"))
      writeOGR(stream.line,  "NHDplusFlowlines.kml", layer="NHDplusFlowlines", driver="KML",dataset_options=c("NameField=COMID","DescriptionField=GNIS_NAME"))    
   }
   if (output_type=="shapefile" | output_type=="both") {               
      writeOGR(basin.shape,  ".", layer="BasinOutline", driver="ESRI Shapefile")
      writeOGR(stream.line,  ".", layer="NHDplusFlowlines", driver="ESRI Shapefile")
   }
   
   #export text file of comIDs, and param.json file with basin attributes
   write.csv(segments, file="featureID.csv", row.names=FALSE)
   area<-area<-sum(catchment.shape$AreaSqKM)
   lat<-attr(centroid,"coords")[,"y"]
   long<-attr(centroid,"coords")[,"x"]
   if (nickname=="")
      param<-toJSON(list(basinid=featureID,area=area,lat=lat,long=long))
   else
      param<-toJSON(list(basinid=featureID,area=area,lat=lat,long=long,nickname=nickname))
   write(param, file = "param.json", ncolumns=1,sep="")
   
   setwd(savedwd)
   return(toJSON(list(featureID=featureID)))
   
   #}
} #end getBasinfromComID


getBasinfromLatLong<-function(lat,long,basedir,output_type="kml",nickname="") {
   
   #create spatialpoint object from coordinates (coordinates are listed in the order long, lat)
   point<-SpatialPoints(matrix(data=c(long,lat),ncol=2,byrow=T), proj4string=CRS(proj4.NHD))
   
   #get catchment that contains the point
   featureID<-over(point,NHDCatch.shape)$FEATUREID
   
   #call previous function to find basin from the NHDplus flowline or catchment feature
   getBasinfromComID(featureID,basedir,output_type=output_type,nickname=nickname)
}