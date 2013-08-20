HBFILES = public/js/apps/weather.handlebars \
public/js/apps/environmental-models.handlebars \
public/js/apps/land-use-models.handlebars \
public/js/apps/fish-models.handlebars

all: handlebars

handlebars: public/js/apps/app-templates.js
  

public/js/apps/app-templates.js: ${HBFILES}  
	handlebars $^ -mf $@
