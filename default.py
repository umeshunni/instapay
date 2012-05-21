import os
import logging
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from django.utils import simplejson

import camjson
import models

class RPCHandler(webapp.RequestHandler):
	def get(self):
		locations = models.CCTVMapLocations.gql("WHERE Published=True LIMIT 10");
		#location_list = locations.fetch(40);
		if(locations == 0):
			self.response.out.write("error")
			return;
		count = 0;
		self.response.out.write("[")
		for location in locations:
			if( count != 0):
				self.response.out.write(",")
			self.response.out.write(camjson.encode(location))
			count = count + 1
			
		self.response.out.write("]")


class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'traffic.html')
        template_values = ''
        self.response.out.write(template.render(path, template_values))



application = webapp.WSGIApplication(
                                     [('/', MainPage),
									 ('/rpc', RPCHandler)],
                                     debug=True)


def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()