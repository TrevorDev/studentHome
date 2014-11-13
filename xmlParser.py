import xml.etree.ElementTree as ET
import MySQLdb

#get the xml tree
tree = ET.parse('/home/jonathan/Documents/Uni/Fourth Year/SoftEng/studentHome/Guelph_open_data/GuelphParks/GuelphParks.xml')
root = tree.getroot()

#connect to the database
db = MySQLdb.connect(host='104.131.173.16',
    				 user='student',
    				 passwd='password',
    				 db='student'
    				)

# get the cursor
cursor = db.cursor()

for child in root:

	#ensure not to add NULL to database
	if child[4].text == None:
		child[4].text = 0
	if child[5].text == None:
		child[5].text = 0
	if child[0].text == None:
		child[0].text = 0
	if child[20].text == None:
		child[20].text = 0
	if child[15].text == None:
		child[15].text = 0
	if child[34].text == None:
		child[34].text = 0
	if child[2].text == None:
		child[2].text = 0
	if child[6].text == None:
		child[6].text = 0
	if child[8].text == None:
		child[8].text = 0
	if child[19].text == None:
		child[19].text = 0
	if child[27].text == None:
		child[27].text = 0
	if child[32].text == None:
		child[32].text = 0
	if child[35].text == None:
		child[35].text = 0
	if child[37].text == None:
		child[37].text = 0
	if child[39].text == None:
		child[39].text = 0
	if child[41].text == None:
		child[41].text = 0
	if child[44].text == None:
		child[44].text = 0
	if child[46].text == None:
		child[46].text = 0
	if child[47].text == None:
		child[47].text = 0
	if child[57].text == None:
		child[57].text = 0
	if child[59].text == None:
		child[59].text = 0
	if child[64].text == None:
		child[64].text = 0

	#add to database
	cursor.execute("""INSERT INTO parks (Latitude, Longitude, ParkName, SoccerFields, HardBallDiamond,
										 BeachVolleyBall, Address, Area, LeashFreeZoneArea, Football_LIT_Irrigated,
										 TennisCourt, BasketballFullCourt, PlayEquipment, SplashPad_Recirculation, IceRink_Artificial,
										 SwimmingPool_Outdoor, ShadeStructure, WashroomBuilding, Concession, Trail_Asphalt,
										 AsphaltParking, BikeRack) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )""",
										( child[4].text,  child[5].text,  child[0].text,  child[20].text, child[15].text,
										  child[34].text, child[2].text,  child[6].text,  child[8].text,  child[19].text,
										  child[27].text, child[32].text, child[35].text, child[37].text, child[39].text,
										  child[41].text, child[44].text, child[46].text, child[47].text, child[57].text,
										  child[59].text, child[64].text ) )

	#commit changes
	db.commit()


#close all connections
cursor.close()
db.close()



