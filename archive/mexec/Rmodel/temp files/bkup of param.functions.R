
###
###
#####
####
##
#

parse.config.setting<-function(setting) {
   #parse.config.setting<-function(config,setting) {
   #parses out any specified parameter from json object
   #returns array of names of required parameters
   config.setting<-list()
   #row<-0
   for (i in 1:length(config)) {
      if( setting %in% names(config[i][[1]]) ) {
         #row<-row+1
         #print( names(config[i]) )
         config.setting[names(config[i])]<-config[i][[1]][setting][[1]]
      }
   }
   return(config.setting)
}

config.info<-function(param.name) {
   #config.info<-function(config,param.name) {
      return( config[param.name][[1]])
}


parse.param<-function(param.name,values.only=T){
   #parse.param<-function(param,param.name,values.only=T){
   #parses param json object, and returns the specified paramaters(s)
   #if requesting only one parameter, option to return value only, or list w/ param name and value
   #if parameter is not present, checks config file for default values
   #  $defaults_used will contain an array of names for all parameters for which default values were used
   #  if no default value found for ANY of the specified parameters, returns null
   
   return.param<-list()

   for (i in 1:length(param.name)) {
      if( param.name[i] %in% names(param) ) {
         return.param[param.name[i]] <- param[param.name[i]][[1]]
      }
      else {

         #if parameter is not found, attempt to find a default value in the config file 
#          if (is.null(config))
#             config<-fromJSON(file=paste0(param$rscript,".config"))
         
#        default<-parse.config.setting(config,"default")[param.name[i]][[1]] 
         default<-parse.config.setting("default")[param.name[i]][[1]] 
         
         if ( !(is.null(default)) ) {
            return.param[param.name[i]]<-default
            if (is.null(return.param$defaults_used))
               return.param$defaults_used<-array(dim=c(1,0,0))
            return.param$defaults_used<-c(return.param$defaults_used,param.name[i]) #note that default was used for this param
         }
         else {  #not found and no default value available
            print(paste("Parameter",param.name[i],"not found in parameter.json file. No default available in config file."))
            return(NULL)
         }
      
      } 
   }
   if (values.only & length(param.name)==1)      
      return(return.param[param.name][[1]])
      #option to return values only, only if requesting a single param
   else
      return(return.param)
      #when requesting multiple param in one call, must return a list of lists
}


parse.wd<-function() {
   #parse.wd<-function(param) {
   userid<-parse.param("userid",values.only=T)
   runid<-parse.param("runid",values.only=T)
   wd<-paste0("/home/ana/testing_dir_structure/runs/",userid,"/",runid)
   return(wd)
}

missing.param<-function(param.name) {
   #missing.param<-function(param,config) {
   #req<-parse.config.setting(config,"required")
   req<-parse.config.setting("required")
   req<-req[req$value==1,]
   #print(req)
   missing<-c()
   for(i in 1:nrow(req)) {
      if (!(req[i,"name"] %in% names(param.name)))
         missing<-c(missing,i)
   }
   if (length(missing)>0)
      return(req[missing,"name"])
   else
      return(NULL)
}


#In a number of places, will print or plot values when testing is set to true
#Set to true when testing/debugging/playing around with the code, false otherwise
testing<-TRUE
#Here are the simple functions that call it
print.to.test<-function(valuetoprint) {  if (testing) print(valuetoprint)  }#end function
plot.to.test<-function(datatoplot,add=F){  
   if (testing) {
      if (add) plot(datatoplot,add)
      else plot(datatoplot)
   }
}#end function














# 
# ## previous versions of functions, saved as back-up
# OLDparse.config.setting<-function(config,setting) {
#    #parses out any specified parameter from json object
#    #returns array of names of required parameters
#    config.setting<-data.frame(matrix(,ncol=2))
#    ###Shouldn't be a data frame, b/c needs to be able to support different data types simultanously
#    ###change to be list of lists (argh, again)
#    names(config.setting)[[1]]<-"name"
#    names(config.setting)[[2]]<-"value"
#    row<-0
#    for (i in 1:length(config)) {
#       if( setting %in% names(config[i][[1]]) ) {
#          row<-row+1
#          #print( names(config[i]) )
#          config.setting[row,"name"]<-names(config[i])
#          #print(config[i][[1]][setting][[1]])
#          config.setting[row,"value"]<-config[i][[1]][setting][[1]]
#       }
#    }
#    return(config.setting)
# }
# OLDparse.wd<-function(param) {
#    userid<-parse.param(param,"userid",values.only=T)
#    runid<-parse.param(param,"runid",values.only=T)
#    rscript<-parse.param(param,"rscript",values.only=T)
#    wd<-paste0("/",userid,"/",rscript,"/",runid)
#    return(wd)
# }
