from google.appengine.tools.bulkloader import Loader
from google.appengine.ext import db
from google.appengine.tools import bulkloader

class CCTVMapLocations(db.Model):  
	LocationName= db.StringProperty()
	Address= db.StringProperty()
	Latitude= db.FloatProperty()
	Longitude= db.FloatProperty()
	CameraURL= db.StringProperty()
	URLDescription= db.StringProperty()
	LocationID= db.StringProperty()
	Published= db.BooleanProperty()


class CCTVMapLocationsLoader(bulkloader.Loader):
	def __init__(self):
		bulkloader.Loader.__init__(self, "CCTVMapLocations",
		               [('LocationName', str),     
		                ('Address', str),     
					    ('Latitude', float),     
					    ('Longitude', float),     
					    ('CameraURL', str),     
					    ('URLDescription', str),     
					    ('LocationID', str),   
						('Published', bool),
						])
		self.alias_old_names()
		

loaders = [CCTVMapLocationsLoader]


