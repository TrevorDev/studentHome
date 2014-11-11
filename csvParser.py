import csv
import MySQLdb


#f = open('/home/jonathan/Documents/Uni/Fourth Year/SoftEng/studentHome/Guelph_open_data/GuelphTransitBusStops.csv')
f = open('/home/jonathan/Documents/Uni/Fourth Year/SoftEng/studentHome/Guelph_open_data/google_transit/stops.txt')
#f = open('/home/jonathan/Documents/Uni/Fourth Year/SoftEng/studentHome/Guelph_open_data/google_transit/stop_times.txt')

csv_f = csv.reader(f)

db = MySQLdb.connect(host='104.131.173.16',
    				 user='student',
    				 passwd='password',
    				 db='student'
    				)

# get the cursor
cursor = db.cursor()

#counter to skip first line of csv
counter = 0

for row in csv_f:

	#skip first line of csv 
	if counter == 0:
		print("first")

	else:

		#ensure we don't add NULL to the Database
		if row[0] == None:
			row[0] = 0
		if row[2] == None:
			row[2] = 0
		if row[5] == None:
			row[5] = 0
		if row[4] == None:
			row[4] = 0

		#insert into the database
		cursor.execute("""INSERT INTO busStops ( stop_id, stop_name, longitude, latitude, DT, UC) VALUES (%s, %s, %s, %s, %s, %s)""",
											( row[0], row[2], row[5], row[4], row[9], row[10]) )

		#commit the changes
		db.commit()

	counter = counter + 1

#close all connections
cursor.close()
db.close()