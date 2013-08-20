
###
### params
###

parse.param<-function(param.name,values.only=T,suppress.errors=F){
   #parses param json object, and returns the specified paramaters(s)
   #multiple parameter names need to be encapulated in c()
   #if requesting only one parameter, option to return value only, or list w/ param name and value
   #if requesting multiple parameters, returns as list of lists
   #if parameter is not present, checks config file for default values
   #  $defaults_used will contain an array of names for all parameters for which default values were used
   #  if no default value found for ANY of the specified parameters, returns null
   
   return.param<-list()

   for (i in 1:length(param.name)) {

      if( param.name[i] %in% names(param) ) {         
         if (length(param[param.name[i]][[1]])>1) {
            #needed to support parameters which are arrays
            return.param[param.name[i]][[1]] <- as.vector( param[param.name[i]][[1]] )
         }
         else {
            return.param[param.name[i]] <- param[param.name[i]][[1]]
         }
      }
      
      
      else {
         #if parameter is not found, attempt to find a default value in the config file 
         default<-parse.config.setting("default")[param.name[i]][[1]] 
         
         if ( !(is.null(default)) ) {
            return.param[param.name[i]]<-default
            if (is.null(return.param$defaults_used)) #if this is the first default value used, create the array
               return.param$defaults_used<-array(dim=c(1,0,0))
            return.param$defaults_used<-c(return.param$defaults_used,param.name[i]) #note that default was used for this param
         }
         else {  #not found and no default value available
            if (!suppress.errors)
               print(paste("Parameter",param.name[i],"not found in parameter.json file. No default available in config file."))
            return(NULL)
         }
      
      } 
   }

   if ( values.only & length(param.name)==1 )      
      return(return.param[param.name][[1]])
      #option to return values only, only if requesting a single param
   else
      return(return.param)
      #when requesting multiple param in one call or if requested, return a list of lists
}



parse.wd<-function() {
   userid<-parse.param("userid",values.only=T)
   runid<-parse.param("runid",values.only=T)
   wd<-paste0("/runs/",userid,"/",runid)
   return(wd)
}

parse.pre.wd<-function() {
   userid<-parse.param("userid",values.only=T)
   preid<-parse.param("pre_run",values.only=T,suppress.errors=T)

   if (is.null(preid) | length(preid)<1)
      return(NULL)
   else
      return( paste0("/runs/",userid,"/",preid) )
}
#    elseif (length(preid)==1) {
#       #if array of preceding runs, rather than a single one
#       wd<-
#           
#    if length(preid)>1
#       
#    else
#       wd<-paste0("/runs/",userid,"/",runid)
#    return(wd)
# }

###
### config
###

config.info<-function(param.name=0) {
   #if called w/o a param name, returns general info about the rmodel
   #if called w/ a param name, returns all attributes about that parameter
   if ( param.name==0) {
      return.list=list()
      return.list$model_step<-config["model_step"][[1]]
      return.list$pre_step<-config["pre_step"][[1]]
      return.list$model_description<-config["model_description"][[1]]
      return.list$param_names<-names(config)
      return(return.list)
   }
   else
      return( config[param.name][[1]] )
}

parse.config.setting<-function(setting,value=NULL) {
   #parses out any specified parameter from json object
   #returns a list of those parameters and their config setting (specified here)
   #if value != null, returns only those where the setting is equal to the specified value
   #  i.e. required == 1
   
   r<-list()

   for (i in 1:length(config)) {
      if( setting %in% names(config[i][[1]]) ) {
         r[names(config[i])]<-config[i][[1]][setting][[1]]
         #config.setting[names(config[i])]<-config[names(config[i])][[1]][setting][[1]]
         #         config.setting[names(config[i])]<-config[i][[1]][setting][[1]]
      }
   }
   if (is.null(value))
      return(r)
      #standard option, return the list of lists
   else
      names(r[r[1:length(r)]==value])
      #if value is specified, return array of names of parameters where the setting = specified value 
}


###
### checks
###

missing.param<-function() {
   #returns an array of names of parameters that are required (according to config file), 
   #but are not included in param file
   
   req<-parse.config.setting("required",value=1)
   missing<-c()
   for(i in 1:length(req)) {
      if (!(req[i] %in% names(param)))
         missing<-c(missing,i)
   }
   if (length(missing)>0)
      return(req[missing])
   else
      return(NULL)
}

missing.pre.run<-function() {
   #checks that all the required previous runs exist
   #coming soon...
}


#Functions to print or plot values only when testing is set to true
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
